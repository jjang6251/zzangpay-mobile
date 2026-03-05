# 🧾 zzangpay-mobile

**QR 기반 블록체인 결제 모바일 앱 (Sepolia Testnet)**

`zzangpay-mobile`은 QR 코드를 스캔하여 결제 요청을 불러오고,  
사용자의 **로컬 지갑으로 트랜잭션을 서명하여 Ethereum Sepolia 네트워크로 전송하는 모바일 결제 앱**입니다.

이 프로젝트는 **Web2 결제 UX + Web3 블록체인 인프라**를 결합한 **QR 기반 온체인 결제 MVP**입니다.

---

# 🚀 Project Overview

zzangpay는 다음과 같은 목표로 만들어진 프로젝트입니다.

- QR 코드 기반 블록체인 결제 UX 구현
- 모바일에서 직접 트랜잭션 서명 및 전송
- Web2 + Web3 혼합 아키텍처 구현
- 향후 **블록체인 모임통장 / Web3 결제 서비스** 확장

---

# 🏗 System Architecture

```
Merchant System
      │
      │ 결제 요청 생성
      ▼
zzangpay-api (Backend)
      │
      │ QR Code 발급
      ▼
User Mobile (zzangpay-mobile)
      │
      │ QR Scan
      │ 결제 요청 조회
      ▼
User Wallet (Local Device)
      │
      │ Transaction Sign
      │ Transaction Send
      ▼
Ethereum Network (Sepolia)
      │
      ▼
Transaction Confirmed
      │
      ▼
zzangpay-api (Tx Monitoring)
```

### 역할 분리

| 구성요소 | 역할 |
|---|---|
| **zzangpay-mobile** | QR 스캔, 결제 확인, 트랜잭션 서명 및 전송 |
| **zzangpay-api** | 결제 요청 생성, 결제 상태 관리, 트랜잭션 모니터링 |
| **Ethereum Sepolia** | 실제 결제 처리 및 온체인 기록 |

---

# 💳 Payment Flow

```
1️⃣ Merchant가 결제 요청 생성
2️⃣ Backend가 QR 코드 생성
3️⃣ 사용자가 zzangpay 앱으로 QR 스캔
4️⃣ 앱이 Backend에서 결제 요청 조회
5️⃣ 사용자 결제 승인
6️⃣ 모바일에서 트랜잭션 서명
7️⃣ Sepolia 네트워크로 트랜잭션 전송
8️⃣ TxHash 반환
9️⃣ Backend가 트랜잭션 확인 및 결제 상태 업데이트
```

---

# 📷 QR Payload Format

QR 코드에는 결제 요청을 조회하기 위한 최소 정보만 포함됩니다.

```json
{
  "schema": "zzangpay:qr:v1",
  "paymentRequestId": "payreq_20260304_0001",
  "apiBaseUrl": "https://api.zzangpay.dev"
}
```

> 실제 결제 정보(금액, 가맹점 주소 등)는 **Backend API에서 조회**합니다.

---

# 🔗 Backend API Example

### 결제 요청 조회

```
GET /v1/payment-requests/{paymentRequestId}
```

Response

```json
{
  "paymentRequestId": "payreq_20260304_0001",
  "status": "REQUESTED",
  "chainId": 11155111,
  "merchant": {
    "name": "ZZANG Store",
    "address": "0xMERCHANT_ADDRESS"
  },
  "payment": {
    "asset": "ETH",
    "amount": "0.001",
    "decimals": 18
  },
  "meta": {
    "orderId": "ORDER_20260304_0001",
    "memo": "Coffee",
    "issuedAt": 1770000000,
    "expiresAt": 1770000600
  }
}
```

---

### 트랜잭션 결과 전송

```
POST /v1/payment-requests/{paymentRequestId}/tx
```

Request Body

```json
{
  "txHash": "0xTX_HASH",
  "from": "0xUSER_ADDRESS"
}
```

---

# ⛓ Blockchain Interaction

모바일 앱은 **ethers.js**를 이용해 Sepolia 네트워크와 직접 통신합니다.

Example

```javascript
import { ethers } from "ethers"

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)

const wallet = new ethers.Wallet(privateKey, provider)

const tx = await wallet.sendTransaction({
  to: merchantAddress,
  value: ethers.parseEther("0.001")
})

console.log("TxHash:", tx.hash)
```

---

# 🔐 Wallet & Key Management

사용자의 개인키는 **모바일 기기 내부에 안전하게 저장됩니다.**

| 플랫폼 | 저장소 |
|---|---|
| iOS | Keychain |
| Android | Keystore |

보안 원칙

- 개인키는 절대 서버로 전송되지 않음
- 모든 트랜잭션 서명은 로컬에서 수행
- 필요 시 생체 인증(FaceID / TouchID) 적용 가능

---

# 🧰 Tech Stack

### Mobile

- React Native
- TypeScript
- QR Scanner Library
- Secure Storage

### Blockchain

- Ethereum Sepolia
- ethers.js
- JSON RPC

### Security

- iOS Keychain
- Android Keystore

---

# 📁 Project Structure

```
zzangpay-mobile
│
├─ src
│  ├─ screens
│  │  ├─ LoginScreen
│  │  ├─ QRScanScreen
│  │  ├─ PaymentConfirmScreen
│  │  └─ PaymentResultScreen
│  │
│  ├─ services
│  │  ├─ walletService
│  │  ├─ blockchainService
│  │  └─ paymentService
│  │
│  ├─ utils
│  │  ├─ qrParser
│  │  └─ formatter
│  │
│  └─ config
│
└─ README.md
```

---

# ⚙️ Environment Variables

```
API_BASE_URL=https://api.zzangpay.dev
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/xxxxxxxx
CHAIN_ID=11155111
```

---

# ✅ MVP Scope

- QR 코드 스캔
- 결제 요청 조회
- 결제 승인 UI
- Sepolia 트랜잭션 전송
- TxHash 표시
- Backend에 결제 결과 전달

---

# 🗺 Future Roadmap

- ERC20 토큰 결제
- Merchant Dashboard
- Payment Smart Contract
- 결제 영수증 시스템
- DAO 기반 모임통장 결제
- DID 기반 사용자 인증

---

# 📄 License

MIT
