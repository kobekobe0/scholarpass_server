function generateRefNumber() {
  const characters = '0000111122223333444455556666777788889999ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Characters to pick from (digits + capital letters)
  const length = 8;

  function generateString() {
    let result = '';
    for (let i = 0; i < length; i++) {
      // Pick a random character from the characters set
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  return generateString();
}

export default generateRefNumber;