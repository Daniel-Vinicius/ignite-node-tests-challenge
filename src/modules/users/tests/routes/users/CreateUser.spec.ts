import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../../app";

import { userFixture } from "../../fixtures/UserFixture";

const user = userFixture();
let connection: Connection;

describe("Create User Route", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create new user", async () => {
    await request(app).post("/api/v1/users").send(user).expect(201);
  })

  it("should not be able to create a user with email duplicate", async () => {
    await request(app).post("/api/v1/users").send(user).expect(400);
  })
})
