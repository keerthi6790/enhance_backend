import { FastifyInstance } from "fastify";
import { createSeoProps, deleteSeoProps, getSeoProps, updateSeoProps } from "./seoprops.controller";
import { $ref } from "./seoprops.schema";

export async function SeoPropsRoutes(server: FastifyInstance) {
    server.post(
        "/",
        {
            schema: {
                body: $ref("CreateSeoPropsSchema"),
                response: {
                    201: $ref("SeoPropsResponseSchema"),
                },
            },
        },
        createSeoProps
    );

    server.get(
        "/:pagename",
        {
            schema: {
                response: {
                    200: $ref("SeoPropsResponseSchema"),
                },
            },
        },
        getSeoProps
    );

    server.put(
        "/:id",
        {
            schema: {
                body: $ref("UpdateSeoPropsSchema"),
                response: {
                    200: $ref("SeoPropsResponseSchema"),
                },
            },
        },
        updateSeoProps
    );

    server.delete(
        "/:id",
        deleteSeoProps
    );
}
