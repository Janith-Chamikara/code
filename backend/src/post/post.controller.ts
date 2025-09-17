import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: memoryStorage(),
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.postService.createPost(createPostDto, file);
  }

  @Get('get-by-event-id')
  async getByEventId(@Query('eventId') eventId: string) {
    return await this.postService.getByEventId(eventId);
  }

  @Get('get-all')
  async getAllPosts() {
    return await this.postService.getAllPosts();
  }

  @Post('upvote')
  async upvote(
    @Query('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return await this.postService.upvote(postId, userId);
  }

  @Post('downvote')
  async downvote(
    @Query('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return await this.postService.downvote(postId, userId);
  }
}
