// 問題データ: answer フィールドなし (正解はその場で管理者が決定する)
export const questions = [
  {
    id: 1,
    text: "日本で一番高い山は？",
    choices: [
      { id: "A", text: "富士山" },
      { id: "B", text: "北岳" },
      { id: "C", text: "奥穂高岳" },
      { id: "D", text: "間ノ岳" },
    ],
  },
  {
    id: 2,
    text: "太陽系で一番大きい惑星は？",
    choices: [
      { id: "A", text: "土星" },
      { id: "B", text: "木星" },
      { id: "C", text: "天王星" },
      { id: "D", text: "海王星" },
    ],
  },
  {
    id: 3,
    text: "日本の首都が東京に移されたのは何年？",
    choices: [
      { id: "A", text: "1853年" },
      { id: "B", text: "1868年" },
      { id: "C", text: "1872年" },
      { id: "D", text: "1889年" },
    ],
  },
  {
    id: 4,
    text: "水の化学式はどれ？",
    choices: [
      { id: "A", text: "CO2" },
      { id: "B", text: "NaCl" },
      { id: "C", text: "H2O" },
      { id: "D", text: "O2" },
    ],
  },
  {
    id: 5,
    text: "「吾輩は猫である」の作者は？",
    choices: [
      { id: "A", text: "芥川龍之介" },
      { id: "B", text: "太宰治" },
      { id: "C", text: "夏目漱石" },
      { id: "D", text: "川端康成" },
    ],
  },
];

export const teams = [
  { id: 1, name: "チーム1", color: "#e94560" },
  { id: 2, name: "チーム2", color: "#0f3460" },
  { id: 3, name: "チーム3", color: "#00b894" },
  { id: 4, name: "チーム4", color: "#e2b714" },
  { id: 5, name: "チーム5", color: "#6c5ce7" },
];
