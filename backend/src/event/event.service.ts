import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  NotificationChannel,
  NotificationType,
} from 'src/notifications/dto/create-notification.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createEvent(createEventDto: CreateEventDto, file: Express.Multer.File) {
    const isEventWithSameTitleExists =
      await this.prismaService.event.findUnique({
        where: { title: createEventDto.title },
      });

    if (isEventWithSameTitleExists) {
      throw new ConflictException(
        'An event with the same title already exists',
      );
    }

    const { adminId, ...eventData } = createEventDto;

    const uploadResult = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      file.originalname,
      {
        folder: `events/${createEventDto.title}`,
        resource_type: 'auto',
      },
    );

    const event = await this.prismaService.event.create({
      data: {
        ...eventData,
        thumbnail: uploadResult.public_id,
        admin: {
          connect: { id: adminId },
        },
      },
    });

    await this.notificationService.create({
      userId: adminId,
      title: `New event has been successfully added`,
      message: `Thank you for adding a new event. Please check the event details for more information.`,
      type: NotificationType.SYSTEM_ALERT,
      channel: NotificationChannel.IN_APP,
    });

    return event;
  }

  async getEventById(eventId: string) {
    const isEventExists = await this.prismaService.event.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!isEventExists) {
      throw new NotFoundException('Cannot find a event for give event id');
    }

    return isEventExists;
  }

  async getALlEvents() {
    return this.prismaService.event.findMany();
  }
}
