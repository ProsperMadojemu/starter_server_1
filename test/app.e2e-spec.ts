import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { LoginAuthDto } from '../src/auth/dto';
import { CreateBookmarkDto, EditBookMarkDto } from '../src/bookmark/dto';

describe('App (e2e)', () => {
  const port = process.env.PORT || 3333;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(port);

    pactum.request.setBaseUrl(`http://localhost:${port}`);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  describe('Auth', () => {
    const dto: LoginAuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body', () => {
        return pactum.spec().post(`/auth/signup`).expectStatus(400);
      });

      it('should signup a user', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum.spec().post(`/auth/signin`).expectStatus(400);
      });

      it('should signin a user', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(`/user/me`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit current user', () => {
        const dto: UpdateUserDto = {
          firstName: 'Prosper',
          email: 'newemail@example.com',
        };
        return pactum
          .spec()
          .patch(`/user`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('empty bookmark', () => {
      it('should get empty bookmark list', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([])
          .expectJsonLength(0);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'New Bookmark',
        link: 'www.google.com',
      };

      it('should throw error for title ', () => {
        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({ link: dto.link })
          .expectStatus(400);
      });

      it('should throw error for link ', () => {
        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            title: dto.title,
          })
          .expectStatus(400);
      });

      it('should create a new bookmark ', () => {
        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmark_id', 'bookmark.id');
      });
    });
    describe('Get bookmarks', () => {
      it('should get current users bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get current users bookmarks by id', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmark_id}');
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: EditBookMarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect()
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
