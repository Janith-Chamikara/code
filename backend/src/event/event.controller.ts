import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Post('create')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
    }),
  )
  async createEventHandler(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.eventService.createEvent(createEventDto, file);
  }

  @Get('get-by-id')
  async getEventById(@Query('eventId') eventId: string) {
    return this.eventService.getEventById(eventId);
  }

  @Get('get-all')
  async getAllEvents() {
    return this.eventService.getALlEvents();
  }
}
