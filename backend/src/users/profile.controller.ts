import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

class UpdateProfileDto {
  name?: string;
  age?: number;
  valorant_agent_icon?: string;
}

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  @Put()
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(req.user.id, {
      name: body.name,
      age: body.age,
      valorant_agent_icon: body.valorant_agent_icon,
    });
    if (!updated) return null;
    const { password_hash, ...safe } = updated as any;
    return safe;
  }
}
