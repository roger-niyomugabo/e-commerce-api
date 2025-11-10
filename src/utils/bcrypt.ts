import { compareSync, genSalt, hash } from 'bcrypt';

export const generate = async (password) => hash(password, await (genSalt)(10));
export const check = (hashedPassword, password) => compareSync(password, hashedPassword);
