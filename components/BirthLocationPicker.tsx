"use client";
import { useState } from "react";
import { useLang } from "@/components/LangProvider";

const THAI_PROVINCES = [
  { name:"กรุงเทพมหานคร", lat:13.7563, lon:100.5018 },
  { name:"กระบี่",         lat:8.0863,  lon:98.9063  },
  { name:"กาญจนบุรี",      lat:14.0228, lon:99.5328  },
  { name:"กาฬสินธุ์",      lat:16.4322, lon:103.5066 },
  { name:"กำแพงเพชร",      lat:16.4828, lon:99.5227  },
  { name:"ขอนแก่น",        lat:16.4419, lon:102.835  },
  { name:"จันทบุรี",       lat:12.6113, lon:102.1038 },
  { name:"ฉะเชิงเทรา",     lat:13.6904, lon:101.0779 },
  { name:"ชลบุรี",         lat:13.3611, lon:100.9847 },
  { name:"ชัยนาท",         lat:15.1852, lon:100.1251 },
  { name:"ชัยภูมิ",        lat:15.8068, lon:102.0315 },
  { name:"ชุมพร",          lat:10.493,  lon:99.18    },
  { name:"เชียงราย",       lat:19.9105, lon:99.8406  },
  { name:"เชียงใหม่",      lat:18.7883, lon:98.9853  },
  { name:"ตรัง",           lat:7.5594,  lon:99.6114  },
  { name:"ตราด",           lat:12.2428, lon:102.5175 },
  { name:"ตาก",            lat:16.8838, lon:99.1258  },
  { name:"นครนายก",        lat:14.2069, lon:101.2131 },
  { name:"นครปฐม",         lat:13.8199, lon:100.0622 },
  { name:"นครพนม",         lat:17.392,  lon:104.7696 },
  { name:"นครราชสีมา",     lat:14.9799, lon:102.0977 },
  { name:"นครศรีธรรมราช",  lat:8.4304,  lon:99.9631  },
  { name:"นครสวรรค์",      lat:15.7047, lon:100.1372 },
  { name:"นนทบุรี",        lat:13.8621, lon:100.5144 },
  { name:"นราธิวาส",       lat:6.4255,  lon:101.8253 },
  { name:"น่าน",           lat:18.7756, lon:100.773  },
  { name:"บึงกาฬ",         lat:18.3609, lon:103.6466 },
  { name:"บุรีรัมย์",      lat:14.993,  lon:103.1029 },
  { name:"ปทุมธานี",       lat:14.0208, lon:100.525  },
  { name:"ประจวบคีรีขันธ์", lat:11.8124, lon:99.7973  },
  { name:"ปราจีนบุรี",     lat:14.05,   lon:101.372  },
  { name:"ปัตตานี",        lat:6.8695,  lon:101.2505 },
  { name:"พระนครศรีอยุธยา", lat:14.3532, lon:100.5689 },
  { name:"พะเยา",          lat:19.1665, lon:99.9019  },
  { name:"พังงา",          lat:8.4501,  lon:98.5255  },
  { name:"พัทลุง",         lat:7.6167,  lon:100.074  },
  { name:"พิจิตร",         lat:16.4418, lon:100.3488 },
  { name:"พิษณุโลก",       lat:16.8211, lon:100.2659 },
  { name:"เพชรบุรี",       lat:13.1112, lon:99.939   },
  { name:"เพชรบูรณ์",      lat:16.419,  lon:101.1606 },
  { name:"แพร่",           lat:18.1446, lon:100.1403 },
  { name:"ภูเก็ต",         lat:7.8804,  lon:98.3923  },
  { name:"มหาสารคาม",      lat:16.1848, lon:103.3007 },
  { name:"มุกดาหาร",       lat:16.5422, lon:104.7209 },
  { name:"แม่ฮ่องสอน",     lat:19.301,  lon:97.9654  },
  { name:"ยโสธร",          lat:15.7926, lon:104.1453 },
  { name:"ยะลา",           lat:6.5411,  lon:101.2804 },
  { name:"ร้อยเอ็ด",       lat:16.0538, lon:103.652  },
  { name:"ระนอง",          lat:9.9529,  lon:98.6085  },
  { name:"ระยอง",          lat:12.6814, lon:101.2816 },
  { name:"ราชบุรี",        lat:13.5283, lon:99.8134  },
  { name:"ลพบุรี",         lat:14.7995, lon:100.6534 },
  { name:"ลำปาง",          lat:18.2888, lon:99.4909  },
  { name:"ลำพูน",          lat:18.5745, lon:99.0087  },
  { name:"เลย",            lat:17.486,  lon:101.7223 },
  { name:"ศรีสะเกษ",       lat:15.1186, lon:104.322  },
  { name:"สกลนคร",         lat:17.1546, lon:104.1348 },
  { name:"สงขลา",          lat:7.1898,  lon:100.5951 },
  { name:"สตูล",           lat:6.6238,  lon:100.0674 },
  { name:"สมุทรปราการ",    lat:13.5991, lon:100.5998 },
  { name:"สมุทรสงคราม",    lat:13.4098, lon:100.0023 },
  { name:"สมุทรสาคร",      lat:13.5475, lon:100.2744 },
  { name:"สระแก้ว",        lat:13.824,  lon:102.0646 },
  { name:"สระบุรี",        lat:14.5289, lon:100.9101 },
  { name:"สิงห์บุรี",      lat:14.8936, lon:100.3967 },
  { name:"สุโขทัย",        lat:17.0056, lon:99.8264  },
  { name:"สุพรรณบุรี",     lat:14.4745, lon:100.1177 },
  { name:"สุราษฎร์ธานี",   lat:9.1382,  lon:99.3215  },
  { name:"สุรินทร์",       lat:14.8829, lon:103.4937 },
  { name:"หนองคาย",        lat:17.8783, lon:102.7413 },
  { name:"หนองบัวลำภู",    lat:17.2218, lon:102.426  },
  { name:"อ่างทอง",        lat:14.5896, lon:100.4551 },
  { name:"อำนาจเจริญ",     lat:15.8585, lon:104.6288 },
  { name:"อุดรธานี",       lat:17.4138, lon:102.7872 },
  { name:"อุตรดิตถ์",      lat:17.6201, lon:100.0993 },
  { name:"อุทัยธานี",      lat:15.3835, lon:100.0246 },
  { name:"อุบลราชธานี",    lat:15.2287, lon:104.8564 },
];

const COUNTRIES = [
  "Thailand","China","United States","United Kingdom","Japan","South Korea",
  "Singapore","Malaysia","Indonesia","Vietnam","Philippines","Myanmar",
  "Cambodia","Laos","India","Pakistan","Bangladesh","Sri Lanka","Nepal",
  "Australia","New Zealand","Canada","Mexico","Brazil","Argentina","Colombia",
  "Germany","France","Italy","Spain","Netherlands","Sweden","Norway","Denmark",
  "Finland","Switzerland","Austria","Belgium","Poland","Portugal","Greece",
  "Russia","Ukraine","Turkey","Saudi Arabia","UAE","Israel","Egypt","South Africa",
  "Nigeria","Kenya","Ghana","Ethiopia","Tanzania","Morocco","Algeria","Tunisia",
  "Hong Kong","Taiwan","Macau","Mongolia","Kazakhstan","Uzbekistan","Azerbaijan",
  "Armenia","Georgia","Iran","Iraq","Jordan","Lebanon","Kuwait","Qatar","Bahrain",
  "Oman","Yemen","Afghanistan","Tajikistan","Turkmenistan","Kyrgyzstan",
  "Papua New Guinea","Fiji","Samoa","Tonga","Vanuatu","Solomon Islands",
  "Timor-Leste","Brunei","Maldives","Bhutan","Afghanistan","Cuba","Haiti",
  "Dominican Republic","Jamaica","Trinidad and Tobago","Panama","Costa Rica",
  "Guatemala","Honduras","El Salvador","Nicaragua","Ecuador","Peru","Chile",
  "Bolivia","Paraguay","Uruguay","Venezuela","Guyana","Suriname",
  "Czech Republic","Slovakia","Hungary","Romania","Bulgaria","Serbia","Croatia",
  "Slovenia","Bosnia and Herzegovina","Montenegro","North Macedonia","Albania",
  "Moldova","Belarus","Lithuania","Latvia","Estonia","Ireland","Iceland",
].sort();

interface Props {
  country: string;
  province: string;
  city: string;
  lat: number;
  lon: number;
  onChangeCountry: (v: string) => void;
  onChangeProvince: (v: string) => void;
  onChangeCity: (v: string) => void;
  onChangeLat: (v: number) => void;
  onChangeLon: (v: number) => void;
}

const LABELS = {
  th: {
    country: "ประเทศที่เกิด",
    province: "จังหวัดที่เกิด",
    city: "เมืองที่เกิด",
    cityPlaceholder: "เช่น Tokyo, New York, London...",
    search: "ค้นหา",
    searching: "กำลังค้นหา...",
    found: "พบแล้ว",
    notFound: "ไม่พบเมืองนี้ ลองพิมพ์ใหม่",
    coordHint: "สามารถแก้ไขพิกัดเองได้หากต้องการ",
  },
  en: {
    country: "Country of birth",
    province: "Province / Region",
    city: "City of birth",
    cityPlaceholder: "e.g. Tokyo, New York, London...",
    search: "Search",
    searching: "Searching...",
    found: "Found",
    notFound: "City not found. Try a different spelling.",
    coordHint: "You can adjust the coordinates manually if needed.",
  },
  zh: {
    country: "出生国家",
    province: "出生省份",
    city: "出生城市",
    cityPlaceholder: "例如：东京、纽约、伦敦…",
    search: "搜索",
    searching: "搜索中…",
    found: "已找到",
    notFound: "未找到该城市，请尝试其他写法",
    coordHint: "如需更精确坐标，可手动调整",
  },
};

export default function BirthLocationPicker({
  country, province, city, lat, lon,
  onChangeCountry, onChangeProvince, onChangeCity, onChangeLat, onChangeLon,
}: Props) {
  const { lang } = useLang();
  const lbl = LABELS[lang] ?? LABELS.en;
  const isThai = country === "Thailand";

  const [searchStatus, setSearchStatus] = useState<"idle"|"loading"|"found"|"error">("idle");
  const [foundName, setFoundName] = useState("");

  async function searchCity() {
    if (!city.trim()) return;
    setSearchStatus("loading");
    try {
      const q = encodeURIComponent(`${city.trim()}, ${country}`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { "Accept-Language": lang === "zh" ? "zh" : lang === "th" ? "th" : "en" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        onChangeLat(parseFloat(parseFloat(data[0].lat).toFixed(4)));
        onChangeLon(parseFloat(parseFloat(data[0].lon).toFixed(4)));
        setFoundName(data[0].display_name.split(",").slice(0, 2).join(","));
        setSearchStatus("found");
      } else {
        setSearchStatus("error");
      }
    } catch {
      setSearchStatus("error");
    }
  }

  return (
    <div className="birth-location-picker">
      {/* Country selector */}
      <label className="lux-field">
        <span>{lbl.country}</span>
        <select
          value={country}
          onChange={e => {
            onChangeCountry(e.target.value);
            setSearchStatus("idle");
            setFoundName("");
          }}
        >
          <option value="Thailand">🇹🇭 Thailand</option>
          <optgroup label="─────────────">
            {COUNTRIES.filter(c => c !== "Thailand").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
        </select>
      </label>

      {/* Thai: province dropdown */}
      {isThai && (
        <label className="lux-field">
          <span>{lbl.province}</span>
          <select
            value={province}
            onChange={e => {
              const p = THAI_PROVINCES.find(x => x.name === e.target.value);
              onChangeProvince(e.target.value);
              if (p) { onChangeLat(p.lat); onChangeLon(p.lon); }
            }}
          >
            {THAI_PROVINCES.map(p => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
      )}

      {/* International: city search */}
      {!isThai && (
        <div className="city-search-row">
          <label className="lux-field" style={{ flex: 1 }}>
            <span>{lbl.city}</span>
            <input
              value={city}
              onChange={e => { onChangeCity(e.target.value); setSearchStatus("idle"); }}
              placeholder={lbl.cityPlaceholder}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchCity(); }}}
            />
          </label>
          <button
            className={`city-search-btn ${searchStatus === "found" ? "found" : ""}`}
            onClick={searchCity}
            disabled={!city.trim() || searchStatus === "loading"}
            type="button"
          >
            {searchStatus === "loading" ? "…" : lbl.search}
          </button>
        </div>
      )}

      {/* Status messages */}
      {!isThai && searchStatus === "found" && (
        <div className="city-search-result found">
          <span>✦</span>
          <div>
            <strong>{lbl.found}</strong>
            <small>{foundName}</small>
          </div>
          <span className="coords-badge">{lat}°, {lon}°</span>
        </div>
      )}
      {!isThai && searchStatus === "error" && (
        <div className="city-search-result error">{lbl.notFound}</div>
      )}

      {/* Coordinate display (both Thai and intl) */}
      <div className="coord-row">
        <label className="lux-field compact-field">
          <span>Lat</span>
          <input type="number" step="0.0001" value={lat}
            onChange={e => onChangeLat(Number(e.target.value))} />
        </label>
        <label className="lux-field compact-field">
          <span>Lon</span>
          <input type="number" step="0.0001" value={lon}
            onChange={e => onChangeLon(Number(e.target.value))} />
        </label>
      </div>
      <small style={{ color:"var(--star-dim)", fontSize:11, marginTop:4, display:"block" }}>
        {lbl.coordHint}
      </small>
    </div>
  );
}
