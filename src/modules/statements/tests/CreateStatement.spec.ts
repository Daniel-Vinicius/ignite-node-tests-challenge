import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../app";
import { userFixture } from "../../users/tests/fixtures/UserFixture";

let connection: Connection;
let userAuthenticatedBody: any;
let headers: { Authorization: string };

describe("Create Statement Route", () => {
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

  it("must be able to make a deposit", async () => {
    const statementCreated = await request(app).post("/api/v1/statements/deposit").set(headers).send({
      description: "Test",
      amount: 50
    }).expect(201)

    expect(statementCreated.body).toHaveProperty("user_id")
    expect(statementCreated.body.type).toEqual("deposit")

    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)

    expect(balance.body).toHaveProperty("balance", 50);
    expect(balance.body).toHaveProperty("statement");
    expect(balance.body.statement.length).toEqual(1);
  });

  it("must be able to make a withdrawal", async () => {
    const statementCreated = await request(app).post("/api/v1/statements/withdraw").set(headers).send({
      description: "Test",
      amount: 20
    }).expect(201)

    expect(statementCreated.body).toHaveProperty("user_id")
    expect(statementCreated.body.type).toEqual("withdraw")

    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)

    expect(balance.body).toHaveProperty("balance", 30);
    expect(balance.body).toHaveProperty("statement");
    expect(balance.body.statement.length).toEqual(2);
  });

  it("it must not be possible to make a withdrawal if you do not have sufficient funds", async () => {
    await request(app).post("/api/v1/statements/withdraw").set(headers).send({
      description: "Test",
      amount: 60
    }).expect(400)

    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)

    expect(balance.body.statement.length).toEqual(2);
  });
})
