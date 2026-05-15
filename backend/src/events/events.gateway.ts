import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidsService } from '../bids/bids.service';
import { AuctionsService } from '../auctions/auctions.service';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('EventsGateway');

  constructor(
    private readonly bidsService: BidsService,
    private readonly auctionsService: AuctionsService,
    private readonly usersService: UsersService,
  ) {
    // Start periodic timer sync
    setInterval(() => this.broadcastTimeSync(), 5000);
  }

  async handleConnection(client: Socket) {
    const auctionId = client.handshake.query.auctionId as string;
    if (auctionId) {
      client.join(`auction_${auctionId}`);
      this.logger.log(`Client ${client.id} joined auction_${auctionId}`);
      
      const auction = await this.auctionsService.findById(auctionId);
      if (auction) {
        const timeLeft = Math.max(0, Math.floor((new Date(auction.end_time).getTime() - Date.now()) / 1000));
        
        // Fetch recent bids for history
        const history = await this.bidsService.getAuctionHistory(auctionId);
        const formattedHistory = history.map(bid => ({
          id: bid.id,
          amount: Number(bid.amount),
          userId: bid.user_id,
          userName: bid.user?.name || bid.user?.email || 'Anonymous Agent',
          userAvatar: bid.user?.valorant_agent_icon || undefined,
          timestamp: bid.timestamp.toISOString()
        }));

        client.emit('auction_state', {
          currentPrice: auction.current_highest_bid,
          timeLeft: timeLeft,
          status: auction.status,
          history: formattedHistory
        });
      }
    }
  }

  private async broadcastTimeSync() {
    // Find all auction rooms
    const rooms = Array.from(this.server.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('auction_'));

    for (const room of rooms) {
      const auctionId = room.split('_')[1];
      const auction = await this.auctionsService.findById(auctionId);
      if (auction && auction.status === 'active') {
        const timeLeft = Math.max(0, Math.floor((new Date(auction.end_time).getTime() - Date.now()) / 1000));
        
        if (timeLeft === 0) {
          this.logger.log(`Auction ${auctionId} expired. Finalizing...`);
          await this.auctionsService.finalizeAuction(auctionId);
          this.server.to(room).emit('auction_state', {
            currentPrice: auction.current_highest_bid,
            timeLeft: 0,
            status: 'ended',
          });
          continue;
        }

        this.server.to(room).emit('auction_state', {
          currentPrice: auction.current_highest_bid,
          timeLeft: timeLeft,
          status: auction.status,
        });
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('place_bid')
  async handlePlaceBid(
    @MessageBody() data: { auctionId: string; amount: number; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Bid received: ${data.amount} from ${data.userId} for auction ${data.auctionId}`);
      
      const auction = await this.auctionsService.findById(data.auctionId);
      if (!auction || auction.status !== 'active') {
        throw new Error('This auction has already concluded or is not active.');
      }

      const timeLeft = Math.floor((new Date(auction.end_time).getTime() - Date.now()) / 1000);
      if (timeLeft <= 0) {
        // Force finalize if not already done
        await this.auctionsService.finalizeAuction(data.auctionId);
        throw new Error('This auction has ended.');
      }

      const newBid = await this.bidsService.processBid(data);
      
      // Get user info for rich display
      const user = await this.usersService.findById(data.userId);
      const enrichedBid = {
        ...newBid,
        userName: user?.name || user?.email || 'Anonymous Agent',
        userAvatar: user?.valorant_agent_icon || undefined
      };
      
      // Broadcast enriched bid to everyone in the room
      this.server.to(`auction_${data.auctionId}`).emit('new_bid', enrichedBid);
      
      return { status: 'success', data: enrichedBid };
    } catch (error: any) {
      this.logger.error(`Bid error: ${error.message}`);
      client.emit('bid_error', { message: error.message });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('send_reaction')
  handleReaction(
    @MessageBody() data: { auctionId: string; emoji: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast the reaction to everyone in the room (including the sender, or we could use broadcast to exclude sender)
    this.server.to(`auction_${data.auctionId}`).emit('new_reaction', {
      id: Math.random().toString(36).substring(7),
      emoji: data.emoji,
    });
  }
}
