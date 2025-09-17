import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  NotificationChannel,
  NotificationType,
} from 'src/notifications/dto/create-notification.dto';
import { ReactionType } from '@prisma/client';

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
      where: { id: post.id },
      data: { imageUrl: uploadResult.public_id },
    });

    await this.notificationService.create({
      userId: createPostDto.userId,
      title: `New post has been successfully added`,
      message: `Thank you for adding a new post.`,
      type: NotificationType.SYSTEM_ALERT,
      channel: NotificationChannel.IN_APP,
    });
    return post;
  }

  async getByEventId(eventId: string) {
    const posts = await this.prismaService.post.findMany({
      where: { eventId },
    });
    return posts;
  }

  async getAllPosts() {
    return await this.prismaService.post.findMany();
  }

  // --- Reactions (Upvote / Downvote) ---
  async upvote(postId: string, userId: string) {
    return await this.handleReaction(postId, userId, ReactionType.UPVOTE);
  }

  async downvote(postId: string, userId: string) {
    return await this.handleReaction(postId, userId, ReactionType.DOWNVOTE);
  }

  private async handleReaction(
    postId: string,
    userId: string,
    desired: ReactionType,
  ) {
    const existing = await this.prismaService.reaction.findFirst({
      where: { postId, userId },
    });

    if (existing) {
      if (existing.type === desired) {
        await this.prismaService.reaction.delete({
          where: { id: existing.id },
        });
        return { postId, userReaction: null };
      }
      await this.prismaService.reaction.update({
        where: { id: existing.id },
        data: { type: desired },
      });
      return { postId, userReaction: desired };
    }

    await this.prismaService.reaction.create({
      data: { postId, userId, type: desired },
    });
    return { postId, userReaction: desired };
  }
}
