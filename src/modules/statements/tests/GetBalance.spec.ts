import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../app";
import { userFixture } from "../../users/tests/fixtures/UserFixture";

let connection: Connection;
let userAuthenticatedBody: any;
let headers: { Authorization: string };

describe("Get Balance Route", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user = userFixture();

    await request(app).post("/api/v1/users").send(user).expect(201);
    const userAuthenticated = await request(app).post("/api/v1/sessions").send(user).expect(200);

    userAuthenticatedBody = userAuthenticated.body;
    headers = {
      Authorization: `Bearer ${userAuthenticated.body.token}`,
    };
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("it should be possible to fetch the user balance", async () => {
    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)

    expect(balance.body).toHaveProperty("balance", 0);
    expect(balance.body).toHaveProperty("statement");
    expect(balance.body.statement.length).toEqual(0);
  });
})
