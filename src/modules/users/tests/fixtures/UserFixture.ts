import faker from 'faker';

faker.locale = "pt_BR"

const firstName = faker.name.firstName(1);
const lastName = faker.name.lastName(1);

export function userFixture() {
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email(firstName, lastName),
    password: faker.internet.password(6),
  }
};
