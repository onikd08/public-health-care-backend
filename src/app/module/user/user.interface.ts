import { Gender } from "../../../generated/prisma/enums";

export interface ICreateDoctor {
  password: string;
  doctor: {
    name: string;
    email: string;
    registrationNumber: string;
    experience: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
  };
  specialties: string[];
}
