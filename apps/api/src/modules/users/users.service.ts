import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInput, UpdateUserInput, AdminCreateUserInput } from './dto/user.input';
import { User, UserRole, AdminCreateUserPayload } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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

    async findAll(take = 50, skip = 0): Promise<User[]> {
        return this.usersRepository.findAll(take, skip);
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

    /**
     * Update user role (SUPER_ADMIN only)
     * Prevents removing the last SUPER_ADMIN
     */
    async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
        const user = await this.findById(userId);

        // If demoting from SUPER_ADMIN, check if this is the last one
        if (user.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
            const allUsers = await this.findAll();
            const superAdminCount = allUsers.filter(u => u.role === UserRole.SUPER_ADMIN).length;

            if (superAdminCount <= 1) {
                throw new BadRequestException('Cannot demote the last SUPER_ADMIN');
            }
        }

        return this.usersRepository.update(userId, { role: newRole } as UpdateUserInput);
    }

    /**
     * Get all users for admin panel (SUPER_ADMIN only)
     */
    async getAllUsersForAdmin(): Promise<User[]> {
        return this.findAll();
    }

    /**
     * Admin creates a user with auto-generated temp password (SUPER_ADMIN only)
     */
    async adminCreateUser(input: AdminCreateUserInput): Promise<AdminCreateUserPayload> {
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

        // Generate a random 10-char alphanumeric temporary password
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let tempPassword = '';
        for (let i = 0; i < 10; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const user = await this.usersRepository.create({
            name: input.name,
            mobile: input.mobile,
            email: input.email,
            age: input.age,
            passwordHash,
            isVerified: true,
            role: input.role ?? UserRole.USER,
        } as CreateUserInput);

        return { user, tempPassword };
    }
}
