import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorators';
import { CreateBookmarkDto, EditBookMarkDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Post()
  createBookmark(
    @GetUser('id') user_id: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(user_id, dto);
  }

  @Get()
  getBookmarks(@GetUser('id') user_id: number) {
    return this.bookmarkService.getBookmarks(user_id);
  }

  @Get(':id')
  getBookmarkById(
    @Param('id', ParseIntPipe) bookmark_id: number,
    @GetUser('id') user_id: number,
  ) {
    return this.bookmarkService.getBookmarkById(bookmark_id, user_id);
  }

  @Patch(':id')
  editBookmarkById(
    @Param('id', ParseIntPipe) bookmark_id: number,
    @GetUser('id') user_id: number,
    @Body() dto: EditBookMarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(bookmark_id, user_id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @Param('id', ParseIntPipe) bookmark_id: number,
    @GetUser('id') user_id: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(bookmark_id, user_id);
  }
}
