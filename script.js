/* =================================================
   1. 管理リスト & グローバル変数定義
   ================================================= */
const TARGETS = ['about', 'work', 'contact', 'sikaku'];

const hamburger = document.getElementById('js-hamburger');
const nav = document.getElementById('js-nav');
const pieces = document.querySelectorAll('.menu-piece');
const slots = document.querySelectorAll('.puzzle-slot');
const thankyouOverlay = document.getElementById('js-thankyou-overlay');

let isDroppedCorrectly = false;


/* =================================================
   2. UIイベント（クリック開閉 & スキップシステム）
   ================================================= */
thankyouOverlay.addEventListener('click', function () {
    this.classList.remove('active');
});

hamburger.addEventListener('click', function () {
    nav.classList.toggle('active');
});

const skipBtn = document.getElementById('js-skip-btn');
if (skipBtn) {
    skipBtn.addEventListener('click', function () {
        localStorage.setItem('puzzle-skipped', 'true');

        TARGETS.forEach(target => {
            const piece = document.getElementById('piece-' + target);
            const slot = document.querySelector(`[data-slot="${target}"]`);
            
            if (piece && slot) {
                slot.innerHTML = '';
                slot.appendChild(piece);
                makePieceClickable(piece, target);
                localStorage.setItem('puzzle-' + target, 'solved');
            }
        });

        if (nav) nav.classList.remove('active');
        updateHandleAttention();
        this.style.display = 'none';

        console.log("【システム】パズルをスキップしました。シークレットキーは出現しません。");
    });
}


/* =================================================
   3. ページ初期化（セーブデータ復元 & リセット判定）
   ================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const navigationEntries = performance.getEntriesByType('navigation');
    
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
        TARGETS.forEach(target => {
            localStorage.removeItem('puzzle-' + target);
        });
        localStorage.removeItem('puzzle-skipped');
        console.log("【システム】パズルをリセットしました。");
        sessionStorage.removeItem('booted');
    }
    
    const currentSkipBtn = document.getElementById('js-skip-btn');
    if (currentSkipBtn && localStorage.getItem('puzzle-skipped') === 'true') {
        currentSkipBtn.style.display = 'none';
    }
    
    if (!sessionStorage.getItem('booted')) {
        runBootLoader();
    } else {
        const loader = document.getElementById('js-loader');
        if (loader) loader.style.display = 'none';
    }
    
    TARGETS.forEach(target => {
        if (localStorage.getItem('puzzle-' + target) === 'solved') {
            const savedPiece = document.getElementById('piece-' + target);
            const targetSlot = document.querySelector(`[data-slot="${target}"]`);
            
            if (savedPiece && targetSlot) {
                targetSlot.innerHTML = '';            
                targetSlot.appendChild(savedPiece);  
                makePieceClickable(savedPiece, target);
            }
        }
    });

    checkAllSolved();
    updateHandleAttention();
});


/* =================================================
   4. 起動ローディングシステム
   ================================================= */
function runBootLoader() {
    const loader = document.getElementById('js-loader');
    const loaderBar = document.getElementById('js-loader-bar');
    const loaderText = document.getElementById('js-loader-text');
    const loaderIcon = document.getElementById('js-loader-icon');

    if (!loader) return;

    let progress = 0;
    const duration = 1200;
    const startTime = performance.now();

    function updateLoader(now) {
        const elapsedTime = now - startTime;
        progress = Math.min((elapsedTime / duration) * 100, 100);

        loaderBar.style.width = progress + '%';
        loaderText.textContent = Math.floor(progress) + '%';

        if (progress < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            loaderIcon.style.display = 'inline-block';
            sessionStorage.setItem('booted', 'true'); 

            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none'; 
                }, 600); 
            }, 500); 
        }
    }
    requestAnimationFrame(updateLoader);
}


/* =================================================
   5. システム共通関数群
   ================================================= */
function makePieceClickable(pieceElement, targetName) {
    pieceElement.style.cursor = 'pointer'; 
    pieceElement.addEventListener('click', function () {
        window.location.href = targetName + '.html'; 
    });
}

function executePieceSnap(pieceElement, slotElement, slotTarget) {
    slotElement.innerHTML = '';      
    slotElement.appendChild(pieceElement);  
    nav.classList.remove('active');
    
    if (pieceElement.id === 'piece-key') {
        setTimeout(() => {
            thankyouOverlay.classList.add('active');
        }, 1000);
        return; 
    }
    
    makePieceClickable(pieceElement, slotTarget);
    localStorage.setItem('puzzle-' + slotTarget, 'solved');
    
    updateHandleAttention(); 
    checkAllSolved();
    
    setTimeout(() => {
        window.location.href = slotTarget + '.html';
    }, 1000);
}

// 全ピースが埋まったかどうかの判定関数
function checkAllSolved() {
    if (localStorage.getItem('puzzle-skipped') === 'true') {
        return;
    }

    const isAllComplete = TARGETS.every(target => {
        return localStorage.getItem('puzzle-' + target) === 'solved';
    });

    if (isAllComplete) {
        console.log("【システム】パズルが全て完成しました。");
        const keyPiece = document.getElementById('piece-key');
        if (keyPiece) {
            keyPiece.style.display = 'block'; 
        }
    }
}

function updateHandleAttention() {
    const handleElement = document.getElementById('js-hamburger');
    if (!handleElement) return;

    const hasAnySolved = TARGETS.some(target => {
        return localStorage.getItem('puzzle-' + target) === 'solved';
    });

    if (!hasAnySolved) {
        handleElement.classList.add('pulse-attention');
    } else {
        handleElement.classList.remove('pulse-attention');
    }
}


/* =================================================
   6. ピース側の操作イベント
   ================================================= */
pieces.forEach(piece => {
    piece.addEventListener('dragstart', function (e) {
        isDroppedCorrectly = false; 
        e.dataTransfer.setData('text/plain', e.target.id);
        nav.classList.remove('active');
    });

    piece.addEventListener('dragend', function () {
        if (!isDroppedCorrectly) {
            nav.classList.add('active');
        }
    });

    piece.addEventListener('click', function () {
        if (!this.parentElement.classList.contains('pieces-container')) {
            return;
        }

        const pieceId = this.id;
        let slotTarget = '';

        if (pieceId === 'piece-key') {
            slotTarget = 'about';
        } else {
            slotTarget = TARGETS.find(target => pieceId.includes(target));
        }

        if (slotTarget) {
            const targetSlot = document.querySelector(`[data-slot="${slotTarget}"]`);
            if (targetSlot) {
                executePieceSnap(this, targetSlot, slotTarget);
            }
        }
    });
});


/* =================================================
   7. スロット側のドラッグ＆ドロップイベント
   ================================================= */
slots.forEach(slot => {
    slot.addEventListener('dragover', function (e) {
        e.preventDefault(); 
    });

    slot.addEventListener('dragenter', function (e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', function () {
        this.classList.remove('drag-over');
    });

    slot.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const pieceId = e.dataTransfer.getData('text/plain');
        const piece = document.getElementById(pieceId);
        const slotTarget = this.getAttribute('data-slot');
        
        if (pieceId.includes(slotTarget) || (pieceId === 'piece-key' && slotTarget === 'about')) {
            isDroppedCorrectly = true;
            executePieceSnap(piece, this, slotTarget);
        }
    });
});