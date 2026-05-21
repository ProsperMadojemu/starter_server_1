import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookMarkDto } from './dto';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async createBookmark(user_id: number, dto: CreateBookmarkDto) {
    try {
      const bookmark = await this.prisma.bookmark.create({
        data: {
          ...dto,
          userId: user_id,
        },
      });
      return { message: 'bookmark added', bookmark };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Bookmark already exists');
        }
      }
      throw error;
    }
  }

  async getBookmarks(user_id: number) {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: {
          userId: user_id,
        },
      });
      return bookmarks;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBookmarkById(bookmark_id: number, user_id: number) {
    try {
      const bookmarks = await this.prisma.bookmark.findFirst({
        where: {
          id: bookmark_id,
          userId: user_id,
        },
      });
      if (!bookmarks) return [];
      return bookmarks;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async editBookmarkById(
    bookmark_id: number,
    user_id: number,
    dto: EditBookMarkDto,
  ) {
    // try {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmark_id,
      },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== user_id)
      throw new ForbiddenException('Access to resources denied');

    const editBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmark_id,
      },
      data: {
        ...dto,
      },
    });
    return { message: 'Bookmark updated', editBookmark };
    // if (!editBookmark) throw new ForbiddenException('Bookmark doesnt exist');
    // } catch (error) {}
  }

  async deleteBookmarkById(bookmark_id: number, user_id: number) {
    // try {
    const bookmarks = await this.prisma.bookmark.delete({
      where: {
        id: bookmark_id,
        userId: user_id,
      },
    });
    return { message: 'bookmark has been deleted', bookmarks };
    // } catch (error) {
    //   console.error(error);
    //   throw error;
    // }
  }
}
