import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserInput, UpdateUserInput } from './dto/user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<User | null> {
        if (!id) return null;
        return this.prisma.user.findUnique({
            where: { id },
        }) as unknown as Promise<User | null>;
    }

    async findByEmail(email: string): Promise<User | null> {
        if (!email) return null;
        return this.prisma.user.findFirst({
            where: { email },
        }) as unknown as Promise<User | null>;
    }

    async findByMobile(mobile: string): Promise<User | null> {
        this.logger.debug(`Finding user by mobile: ${mobile} (type: ${typeof mobile})`);
        if (!mobile) return null;
        try {
            return await this.prisma.user.findFirst({
                where: { mobile },
            }) as unknown as Promise<User | null>;
        } catch (error: any) {
            this.logger.error(`Error finding user by mobile: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        }) as unknown as Promise<User[]>;
    }

    async create(input: CreateUserInput): Promise<User> {
        return this.prisma.user.create({
            data: input,
        }) as unknown as Promise<User>;
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: input,
        }) as unknown as Promise<User>;
    }

    async delete(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        }) as unknown as Promise<User>;
    }
}
