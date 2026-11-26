# 한국어 · iDrive 7 스킨 패키지 만드는 방법

이 저장소 주인 1인이 자기 차에서 테스트하는 목적의 개인 사본입니다(README 맨 위의 허락 기록, `LICENSE.md`).
공개 저장소로 복사하지 않고, 패키지나 Store 소스 토큰을 남에게 주지 않습니다.

## 무엇을 바꾸나

| 앱 | 원본 (main) | 이 사본 (test) | 패키지 이름 |
|---|---|---|---|
| Seats | `iteriodev_seats` 1.6.4 | 1.7.0 | `akakingj_seats` |
| Turn View | `iteriodev_turnview` 1.7.1 | 1.8.0 | `iteriodev_turnview` (원본과 같음) |
| Drive Recorder | `oap-driverecorder-next` 2.5.2 | 2.6.0 | `oap-driverecorder-next` (원본과 같음) |
| Tailscale | `iteriodev_tailscale` 1.2.1 | 1.3.0 | `akakingj_tailscale` |
| Ambient Light | `iteriodev_ambient` 1.4.4 | 1.5.0 | `akakingj_ambient` |

- 기능은 그대로이고 `tools/`는 건드리지 않습니다. 화면 글자(한국어 고정)와 색·포커스 모양(iDrive 7 순정 스킨 고정)만 바뀝니다.
- Turn View와 Drive Recorder는 이름을 바꾸지 않습니다. 턴 뷰 도구는 `iteriodev_turnview`로 앱을 시작하고,
  Drive Recorder는 카메라 녹화 허용 키(`/data/oap-driverecorder-next/@enabled`)와 플레이어 도구(`setup.sh`,
  `autostart.sh`, `usb-rw.sh`)가 `oap-driverecorder-next`로 앱을 찾기 때문입니다. 두 앱은 원본 대신 설치되고,
  원본이 이 사본보다 높은 버전을 내면 Store가 원본으로 업데이트를 권할 수 있습니다.
- Turn View 계기판의 회전 카드는 도구가 그리므로 영어 그대로입니다. 보정 화면의 표시선 범례는 계기판 선 색(빨강,
  호박색, 초록)을 그대로 씁니다.
- 경고(호박색)와 정상(초록) 상태 색은 뜻이 있으므로 그대로 둡니다.

## 파일

- `ak/apps.json`: 앱 목록(원본 id·버전, 새 id·버전, loggingId, keepId, Store의 한국어 제목·설명).
- `ak/repack.js`: main에 커밋된 원본 tgz를 풀어 이름을 바꾸고, `ak/common/kit`(한국어 모듈 `ak_ko.js`, 글꼴)과
  앱의 `ak/apps/<id>/ko.json`을 넣고, `ak/edits.js`의 수정을 하고, 다시 묶어 `apps/<id>/<id>@<버전>.tgz`로 씁니다.
  각 `rhmiData/**/en_GB.json` 옆에 `ko.json`으로 번역한 `ko_KR.json`을 만들고(없는 말이 있으면 멈춤),
  `apps/<id>/app.json`에 `texts.ko`(Store의 한국어 제목·설명)를 넣습니다.
- `ak/edits.js`: 원본 파일에 하는 작은 정확한 치환들. 찾는 글이 정해진 횟수만큼 없으면 멈추므로, 원본이 바뀌면 여기서
  먼저 드러납니다.
  - 번역: kit의 `record.js`·`canvas.js` `text()`/`textWidth()`가 그리기 전에 `KO.tr()`로 바꾸고, 한글이 있으면
    한국어 글꼴로 그립니다. `widgets.js`의 `fit`/`wrap`은 번역한 글로 자르고 줄을 바꿉니다.
  - 스킨: `themes.js`에 `SKINS.idrive7`, `gpu.js`가 그것을 쓰고, `tele-widgets.js`의 색표 C와 버튼·세그먼트·
    체크박스·슬라이더·선택 줄 모양(주황 그라데이션 포커스 `focus7`, 은색 슬라이더 `silver7`), `tele-comfort.js`,
    `controller.js`의 컨트롤러 포커스. `screens.json`의 색은 `RECOLOR` 표대로 바꿉니다.
  - 앱마다: 앱 `src/`의 색 상수, Turn View 범례 색.
- `ak/common/kit/ak_ko.js`: `tr(s)` 번역(정확히 같은 글, 다음으로 `{0}` 패턴을 순서대로, 대문자 글은 대소문자 무시),
  `font(family, s)` 한국어 글꼴 선택.
- `ak/apps/<id>/ko.json`: `{ "영어": "한국어" }`. `{0}`, `{1}`은 아무 글이나 받아 다시 번역합니다. `_`로 시작하는
  키는 설명(`_note`)과 영어로 두는 글(`_keep`: 개발자 표기, 상표, 이름, 예시 값, 진단 값).
- `ak/bake_korean.py`: 모든 `ko.json`의 글자로 Noto Sans CJK KR(OFL, `fonts/OFL-NotoSansCJK.txt`) 글꼴 지도를
  만듭니다. `ak_korean` 22·28, `ak_korean_bold` 28, 지도마다 512줄 이하(넘으면 멈춤). 다섯 앱이 같은 글꼴 파일을
  씁니다.
- `ak/strings.js`: 앱이 그릴 수 있는 영어 후보 목록(`ko.json`을 만들 때 참고).
- `ak/preview.js`: 화면을 PC에서 그려 PNG로 저장하고, 번역 못 한 영어를 출력합니다.
- `ak/check.js`: PC 점검(아래).

## 원본이 바뀌었을 때

1. IterioDev의 새 패키지를 main에 커밋하는 것은 저장소 주인이 지시할 때만 합니다.
2. `ak/apps.json`의 `fromVersion`을 맞추고, 버전 규칙대로 이 사본의 `version`을 올립니다(원본 번호 위로).
3. `node ak/strings.js <풀린 패키지>`로 새 영어를 찾아 `ko.json`에 넣고, `python3 ak/bake_korean.py`.
4. `node ak/repack.js`(멈추면 `ak/edits.js`를 원본에 맞게 고침), `node ak/check.js`, `node ak/preview.js`로 확인.

## PC 점검 (`node ak/check.js`)

- 파일: `apps/<id>/`에 app.json, tgz, README, icon, screenshots만 있고 원본 폴더가 없음(keepId 제외). 패키지에
  `.mgu`, `dist/`, `oap-sdk`가 없음.
- 이름: mgu-app.json, package.json, rhmiData/application.json, app.json의 id·버전이 같음.
- 문법: 모든 `.js`에 `node --check`, 모든 `.json` 읽기.
- HMI 글: 모든 `en_GB.json` 옆에 같은 키의 한국어 `ko_KR.json`.
- 한국어 모듈·글꼴이 `ak/common`과 같고, 지도 512줄 이하, `ko.json`의 모든 글자가 모든 지도에 있음.
- 남은 영어: 화면마다 iDrive 7·8 배치로 그려서 `ko.json`에 없는 영어(`_keep` 제외)가 없음. 화면 파일의 예시 값만
  그리므로, 실행 중에만 나오는 글은 `ak/strings.js`로 소스를 보고 넣습니다.

실차 테스트는 하지 않았습니다. 차에서 확인할 것: 각 앱이 한국어로 열리는지, 글자가 잘리거나 겹치지 않는지,
컨트롤러 포커스가 보이는지, Drive Recorder가 계속 녹화하는지, Turn View 카메라가 계기판에 나오는지.
