import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../app";
import { userFixture } from "../../users/tests/fixtures/UserFixture";

let connection: Connection;
let userAuthenticatedBody: any;
let headers: { Authorization: string };

describe("Get Statement Route", () => {
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

  it("should be able to get a statement", async () => {
    const { body } = await request(app).post("/api/v1/statements/deposit").set(headers).send({
      description: "Test",
      amount: 50
    }).expect(201);

    const statement = await request(app).get(`/api/v1/statements/${body.id}`).set(headers).expect(200);

    expect(statement.body).toHaveProperty("description", "Test");
    expect(statement.body).toHaveProperty("amount", "50.00");
  });

  it("should not be able to get a non-existent statement", async () => {
    await request(app).get(`/api/v1/statements/${uuidv4()}`).set(headers).expect(404);
  });
})
