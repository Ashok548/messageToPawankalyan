import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInput, UpdateUserInput } from './dto/user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) { }

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findByEmail(email);
    }

    async findByMobile(mobile: string): Promise<User | null> {
        return this.usersRepository.findByMobile(mobile);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.findAll();
    }

    async create(input: CreateUserInput): Promise<User> {
        // Check if mobile already exists
        const existingMobile = await this.usersRepository.findByMobile(input.mobile);
        if (existingMobile) {
            throw new ConflictException('Mobile number already exists');
        }

        // Check if email already exists (if provided)
        if (input.email) {
            const existingEmail = await this.usersRepository.findByEmail(input.email);
            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        return this.usersRepository.create(input);
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        // Check if user exists
        await this.findById(id);

        // If email is being updated, check for conflicts
        if (input.email) {
            const existing = await this.usersRepository.findByEmail(input.email);
            if (existing && existing.id !== id) {
                throw new ConflictException('Email already exists');
            }
        }

        return this.usersRepository.update(id, input);
    }

    async delete(id: string): Promise<User> {
        // Check if user exists
        await this.findById(id);
        return this.usersRepository.delete(id);
    }
}
