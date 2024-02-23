import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export default class RegisterRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
}