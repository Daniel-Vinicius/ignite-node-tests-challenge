import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../app";

import { userFixture } from "./fixtures/UserFixture";

let connection: Connection;

describe("Profile User Route", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able to show unauthenticated user profile", async () => {
    await request(app).get("/api/v1/profile").expect(401)
  })

  it("must be able to show authenticated user profile", async () => {
    const user = userFixture();

    await request(app).post("/api/v1/users").send(user).expect(201);
    const userAuthenticated = await request(app).post("/api/v1/sessions").send(user).expect(200);

    const profileUserReturned = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${userAuthenticated.body.token}`,
    }).expect(200)

    expect(profileUserReturned.body).toHaveProperty("created_at")
    expect(profileUserReturned.body.id).toEqual(userAuthenticated.body.user.id)
  });
})
