import { createHash } from "node:crypto";

const getHeader = (request: Request, header: string) => {
    return request.headers.get(header) || "";
};

export function getUserId(request: Request) {
    const userId =
        getHeader(request, "x-forwarded-for") +
        getHeader(request, "sec-ch-ua-platform") +
        getHeader(request, "user-agent");
    return createHash("md5").update(userId).digest('hex');
}
