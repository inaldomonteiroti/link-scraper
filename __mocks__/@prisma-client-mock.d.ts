declare module "@prisma/client" {
  export class PrismaClient {
    constructor();

    user: {
      findUnique: (args: any) => Promise<any>;
      findFirst: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      upsert: (args: any) => Promise<any>;
    };

    $disconnect: () => Promise<void>;
    $connect: () => Promise<void>;
    $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>;

    link: {
      deleteMany: (args: any) => Promise<any>;
      createMany: (args: any) => Promise<any>;
      count: (args: any) => Promise<number>;
      findMany: (args: any) => Promise<any[]>;
    };

    page: {
      update: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      count: (args: any) => Promise<number>;
      findMany: (args: any) => Promise<any[]>;
      findFirst: (args: any) => Promise<any>;
    };
  }
}
