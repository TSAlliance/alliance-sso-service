import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export enum AccountType {
    USER = "account_user",
    SERVICE = "account_service"
}

export abstract class Account {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ default: AccountType.USER })
    public accountType: AccountType;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ nullable: false })
    public credentialHash: string;

    public abstract hasPermission(permission: string): boolean;

    
}