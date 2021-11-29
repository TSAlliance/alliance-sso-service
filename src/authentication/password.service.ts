import { Injectable } from '@nestjs/common';
import bcrypt from "bcrypt"

@Injectable()
export class PasswordService {
  public encodePassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public comparePasswords(password: string, hashedPassword: string): boolean {
      return bcrypt.compareSync(password, hashedPassword);
  }
}
