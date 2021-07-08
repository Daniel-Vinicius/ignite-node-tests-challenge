import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../../app";

import { userFixture } from "../../fixtures/UserFixture";

let connection: Connection;

describe("Authenticate User Route", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able authenticate a inexistent user", async () => {
    const user = userFixture();

    await request(app).post("/api/v1/sessions").send(user).expect(401);
  });

  it("should not be able authenticate a user with incorrect password", async () => {
    const user = userFixture();

    await request(app).post("/api/v1/users").send(user).expect(201);
    await request(app).post("/api/v1/sessions").send({ ...user, password: "incorrectPassword" }).expect(401);
  });

  it("should be able authenticate a user", async () => {
    const user = userFixture();

    await request(app).post("/api/v1/users").send(user).expect(201);
    const responseToken = await request(app).post("/api/v1/sessions").send(user).expect(200);

    expect(responseToken.body).toHaveProperty("token");
    expect(responseToken.body).toHaveProperty("user");
    expect(responseToken.body.user).toHaveProperty("id");
    expect(responseToken.body.user).toHaveProperty("name");
    expect(responseToken.body.user).not.toHaveProperty("password");
    expect(responseToken.body.user.email).toEqual(user.email);
  });
})
