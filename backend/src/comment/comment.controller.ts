import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create')
  async create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Get('by-post')
  async getByPost(@Query('postId') postId: string) {
    return this.commentService.getByPost(postId);
  }
}
