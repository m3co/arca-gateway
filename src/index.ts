
import { readFileSync } from 'fs';
import { parse } from 'ini';

export const config = parse(readFileSync('config.ini', 'utf-8'));
