const axios = require('axios');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1512824113985753178';
const VERSION = process.env.RELEASE_VERSION;
const BODY = process.env.RELEASE_BODY;
const RELEASE_URL = process.env.RELEASE_URL;

if (!BOT_TOKEN) {
    console.error("DISCORD_BOT_TOKEN is missing!");
    process.exit(1);
}

const api = axios.create({
    baseURL: 'https://discord.com/api/v10',
    headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateDownloadLink() {
    try {
        const res = await api.get(`/guilds/${GUILD_ID}/channels`);
        const channels = res.data;
        const downloadChannel = channels.find(c => c.name === '앱다운로드-app-download');

        if (downloadChannel) {
            console.log("📝 기존 메시지 삭제 중...");
            const msgsRes = await api.get(`/channels/${downloadChannel.id}/messages`);
            for (const msg of msgsRes.data) {
                await api.delete(`/channels/${downloadChannel.id}/messages/${msg.id}`);
                await delay(300);
            }

            console.log("📝 새로운 릴리즈 공지 전송 중...");
            
            // v1.2.0 과 같이 넘어온 태그에서 숫자를 추출하거나 그대로 사용
            const versionStr = VERSION || "최신 버전";
            const exeLink = `https://github.com/minseokk7/poe2filter-releases/releases/download/${versionStr}/POE2_AutoFilter_${versionStr.replace('v', '')}_x64-setup.exe`;
            
            await api.post(`/channels/${downloadChannel.id}/messages`, {
                embeds: [
                    {
                        title: `🚀 패스오브엑자일 2 자동 필터 앱 ${versionStr} 출시`,
                        description: `${BODY}\n\n[🔗 깃허브 릴리즈 노트 보기](${RELEASE_URL})`,
                        color: 0x3498db,
                        fields: [
                            {
                                name: "🔗 최신 버전 직접 다운로드 (Direct Download)",
                                value: `**[👉 ${versionStr} 설치 파일 다운로드 (Click Here to Download)](${exeLink})**`
                            },
                            {
                                name: "💡 설치 방법 (How to install)",
                                value: `1. 위 링크를 눌러 \`POE2_AutoFilter_${versionStr.replace('v', '')}_x64-setup.exe\` 파일을 다운로드합니다.\n2. 앱을 실행하고 게임과 연동한 뒤, [디스코드로 인증하기] 버튼을 눌러 앱 잠금을 해제하세요!\n\n1. Download the \`setup.exe\` file from the link.\n2. Run the app and click the [Verify with Discord] button!`
                            }
                        ]
                    }
                ]
            });
            console.log("✅ 메시지 업데이트 완료!");
        } else {
            console.error("채널을 찾을 수 없습니다.");
        }
    } catch (e) {
        console.error("오류 발생:", e.response ? e.response.data : e.message);
        process.exit(1);
    }
}

updateDownloadLink();
