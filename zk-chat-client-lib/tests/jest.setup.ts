import { Crypto } from "@peculiar/webcrypto";
import 'jest-localstorage-mock';

global.crypto = new Crypto()

