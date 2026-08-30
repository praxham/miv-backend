import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { env } from "cloudflare:workers";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const d1Database = (env as any).DB as D1Database;
    const adapter = new PrismaD1(d1Database);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}