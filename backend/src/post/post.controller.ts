import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
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
}
