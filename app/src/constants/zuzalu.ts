export const PCD_GITHUB_URL = "https://github.com/proofcarryingdata/pcd";

export const IS_PROD = process.env.NODE_ENV === "production";

export const PASSPORT_URL = IS_PROD
  ? "https://zupass.org/"
  : `${process.env.REACT_APP_PASSPORT_SERVER}/`;

export const SEMAPHORE_GROUP_URL = IS_PROD
  ? "https://api.pcd-passport.com/semaphore/1"
  : `${process.env.REACT_APP_PASSPORT_CLIENT}/semaphore/1`;
