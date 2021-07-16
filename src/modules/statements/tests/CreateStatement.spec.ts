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

  it("it must not be possible to make a withdrawal or transfer if you do not have sufficient funds", async () => {
    await request(app).post("/api/v1/statements/withdraw").set(headers).send({
      description: "Test",
      amount: 60
    }).expect(400)

    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)

    expect(balance.body.statement.length).toEqual(2);
  });

  it("should be able to make a transfer", async () => {
    const newUser = userFixture();
    await request(app).post("/api/v1/users").send(newUser).expect(201);
    const newUserAuthenticated = await request(app).post("/api/v1/sessions").send(newUser).expect(200);

    const transfer = await request(app).post("/api/v1/statements/transfer").set(headers).send({
      description: "Test",
      amount: 10,
      sender_id: newUserAuthenticated.body.user.id
    }).expect(201);


    const balance = await request(app).get("/api/v1/statements/balance").set(headers).expect(200)
    const balanceNewUser = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${newUserAuthenticated.body.token}`,
    }).expect(200)

    expect(transfer.body.type).toEqual("transfer")
    expect(balance.body.statement.length).toEqual(3);
    expect(balance.body.balance).toEqual(20);

    expect(balanceNewUser.body.statement.length).toEqual(1);
    expect(balanceNewUser.body.balance).toEqual(10);
  });
})
