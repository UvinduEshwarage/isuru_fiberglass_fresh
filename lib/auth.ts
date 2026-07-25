// import jwt from "jsonwebtoken";

// const jwtSecret = process.env.JWT_SECRET;
// if (!jwtSecret) {
//   throw new Error("Missing JWT_SECRET in environment");
// }

// const SECRET: string = jwtSecret;

// export function signJwt(
//   payload: Record<string, unknown>,
//   options?: { expiresIn?: number | string }
// ): string {
//   const expiresIn = options?.expiresIn ?? 3600; // default 1h in seconds
//   return jwt.sign(payload, SECRET, {
//     expiresIn,
//   } as any);
// }

// export function verifyJwt(token: string): Record<string, unknown> {
//   if (!token) {
//     throw new Error("Missing token");
//   }

//   try {
//     const decoded = jwt.verify(token, SECRET, {
//       algorithms: ["HS256"],
//     });
//     if (typeof decoded === "string") {
//       return { data: decoded };
//     }
//     return decoded as Record<string, unknown>;
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Invalid token";
//     throw new Error(message);
//   }
// }
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment");
}

const SECRET = jwtSecret;

export interface JwtPayload {
  email: string;
  name: string;
  role: string;
}

export function signJwt(
  payload: JwtPayload,
  options?: { expiresIn?: number | string },
): string {
  const expiresIn = options?.expiresIn ?? 3600;

  return jwt.sign(payload, SECRET, {
    expiresIn,
  } as any);
}

export function verifyJwt(token: string): JwtPayload {
  if (!token) {
    throw new Error("Missing token");
  }

  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
    });

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    return decoded as JwtPayload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    throw new Error(message);
  }
}
