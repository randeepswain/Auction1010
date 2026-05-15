import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { getWsUrl } from '@/utils/api';

export type Bid = {
  id: string;
  amount: number;
  userId: string;
  userName?: string;
  userAvatar?: string;
  timestamp: string;
};

export type Reaction = {
  id: string;
  emoji: string;
};

export function useAuctionSocket(auctionId: string) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the WebSocket gateway
    const socketIo = io(getWsUrl(), {
      query: { auctionId },
      transports: ['websocket'],
    });

    socketRef.current = socketIo;

    socketIo.on('auction_state', (state: { currentPrice: number; timeLeft: number; history?: Bid[] }) => {
      setCurrentPrice(state.currentPrice);
      setTimeLeft(state.timeLeft);
      if (state.history) {
        setBids(state.history);
      }
    });

    // Listen for new bids broadcasted by the server
    socketIo.on('new_bid', (bidData: Bid) => {
      setBids((prevBids) => [bidData, ...prevBids]);
      setCurrentPrice(bidData.amount);
    });

    socketIo.on('new_reaction', (reaction: Reaction) => {
      setReactions((prev) => [...prev, reaction]);
      // Remove reaction after animation finishes (3s)
      setTimeout(() => {
        setReactions((prev) => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [auctionId]);

  const placeBid = (amount: number, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('place_bid', { auctionId, amount, userId });
    }
  };

  const sendReaction = (emoji: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_reaction', { auctionId, emoji });
    }
  };

  return { bids, currentPrice, timeLeft, reactions, placeBid, sendReaction };
}
