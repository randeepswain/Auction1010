import { Controller, Post, Body, Get, Put, UseGuards, UseInterceptors, UploadedFile, Delete, Param, Inject, forwardRef } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuctionsService } from './auctions.service';
import { BidsService } from '../bids/bids.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('auctions')
export class AuctionsController {
  constructor(
    private auctionsService: AuctionsService,
    @Inject(forwardRef(() => BidsService))
    private bidsService: BidsService,
  ) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('create')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG images are allowed'), false);
      }
    }
  }))
  async createAuction(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    let imageUrl = file ? `/uploads/${file.filename}` : undefined;
    
    if (!imageUrl && body.title) {
      imageUrl = await this.auctionsService.fetchSkinImage(body.title);
    }

    // Admin creates an auction
    return this.auctionsService.create({
      title: body.title,
      starting_bid: parseFloat(body.starting_bid),
      start_time: new Date(),
      end_time: new Date(Date.now() + parseInt(body.duration_minutes) * 60000),
      max_users: parseInt(body.max_users) || 100,
      status: 'active',
      image_url: imageUrl
    });
  }

  @Get()
  async getAllAuctions() {
    return this.auctionsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteAuction(@Param('id') id: string) {
    return this.auctionsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id/launch')
  async launchAuction(@Param('id') id: string) {
    return this.auctionsService.launchAuction(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateAuction(@Param('id') id: string, @Body() body: any) {
    // If price is being updated, sync with Redis
    if (body.current_highest_bid) {
      await this.bidsService.updateManualBid(id, parseFloat(body.current_highest_bid));
    }
    
    // Explicitly pick allowed fields to avoid TypeORM errors with primary keys/readonly fields
    const updateData: any = {};
    const allowedFields = ['title', 'starting_bid', 'current_highest_bid', 'duration_minutes', 'max_users', 'status', 'image_url', 'start_time', 'end_time'];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'end_time' || field === 'start_time') {
          updateData[field] = new Date(body[field]);
        } else if (field === 'starting_bid' || field === 'current_highest_bid') {
          updateData[field] = parseFloat(body[field]);
        } else if (field === 'duration_minutes' || field === 'max_users') {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });
    
    return this.auctionsService.update(id, updateData);
  }
}
