import bcrypt from "bcrypt";
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Hash a plain-text password securely using bcrypt.
 * @param password - The plain-text password to hash.
 * @param saltRounds - The number of salt rounds for hashing. Default is 10.
 * @returns A promise that resolves to the hashed password.
 * @throws Will throw an error if the hashing process fails.
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    // console.error("Error hashing password:", error);
    throw new Error("Failed to hash password. Please try again.");
  }
}

/**
 * Compare a plain-text password with a hashed password.
 * @param password - The plain-text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to true if the passwords match, otherwise false.
 * @throws Will throw an error if the comparison process fails.
 */
export async function compareHash(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    // console.error("Error comparing passwords:", error);
    throw new Error("Failed to compare passwords. Please try again.");
  }
}
