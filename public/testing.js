async function testDataReading() {
    const fileName = "8_22_2024 NCAA Data Log.txt"
    const res = await fetch(fileName)
    .then((res) => res.text())
    .then((text) => {
        return JSON.parse(text);
    })
    .catch((e) => console.error(e));
    console.log(res);
    return res;
}