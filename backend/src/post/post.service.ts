import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  NotificationChannel,
  NotificationType,
} from 'src/notifications/dto/create-notification.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationsService,
  ) {}

  async createPost(createPostDto: CreatePostDto, file: Express.Multer.File) {
    const post = await this.prismaService.post.create({
      data: createPostDto,
    });

    const uploadResult = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      file.originalname,
      {
        folder: `posts/${post.id}`,
        resource_type: 'auto',
      },
    );

    await this.prismaService.post.update({
      where: {
        id: post.id,
      },
      data: {
        imageUrl: uploadResult.public_id,
      },
    });

    await this.notificationService.create({
      userId: createPostDto.userId,
      title: `New event has been successfully added`,
      message: `Thank you for adding a new event. Please check the event details for more information.`,
      type: NotificationType.SYSTEM_ALERT,
      channel: NotificationChannel.IN_APP,
    });
    return post;
  }

  async getByEventId(eventId: string) {
    const posts = await this.prismaService.post.findMany({
      where: {
        eventId: eventId,
      },
    });

    return posts;
  }

  async getAllPosts() {
    return await this.prismaService.post.findMany();
  }
}
