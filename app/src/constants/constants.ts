export const roomTypes = {
  public: "public",
  private: "private",
  oneOnOne: "direct"
};

export const identitySecret = [
  "292199313053995090417273958361373808790528937259298737824851232628819755919",
  "435256442305816652798840731460305442885252868681669890164539140005984156217",
  "313000358055837983043982124910255412574975016650425590676697466105631764836",
  "431949582726371741160269588588746814819468594499121003236997389366732549671",
  "386947219625438950790208844654890446215050173194006496467610509175610085769",
  "406376955310641747798854366220149824426200737437991064070520975038250621225",
  "229175058692102982106872259355039715347207609158857483344835381812873593170",
  "163334061393674327105174944950480885010102997192279119202426081876815328325",
  "11437531512502006611249802511569299406013863708736381461713283259250234558",
  "216536453410511343986078619172555451653395528739428071816041036609205931217"
];

export const identityCommitment =
  "17653365708849444179865362482568296819146357340229089950066221313927057063266";

export const clientUrl = `${process.env.REACT_APP_ENV}`;

export const serverUrl = `${process.env.REACT_APP_SERVER_HOST}`;

export const socketUrl = `${process.env.REACT_APP_SOCKET_HOST}`
