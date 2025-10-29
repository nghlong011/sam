document.addEventListener('DOMContentLoaded', function () {
    var trigger2 = document.getElementById('BUTTON_TEXT2');
    var target15 = document.getElementById('SECTION15');
    if (trigger2 && target15) {
        var HEADER_OFFSET = 80;
        trigger2.addEventListener('click', function () {
            var rect = target15.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var targetTop = rect.top + scrollTop - HEADER_OFFSET;
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
    }

    // Countdown 7 giờ cho #COUNTDOWN1 và đồng bộ #COUNTDOWN2
    var countdown1 = document.getElementById('COUNTDOWN1');
    var countdown2 = document.getElementById('COUNTDOWN2');
    if (countdown1 || countdown2) {
        function getSpans(root) {
            if (!root) return [];
            var container = root.querySelector('.ladi-countdown');
            if (!container) return [];
            return container.querySelectorAll('.ladi-element .ladi-countdown-text span');
        }

        var spans1 = getSpans(countdown1);
        var spans2 = getSpans(countdown2);

        // Kỳ vọng thứ tự: [days, hours, minutes, seconds]
        var STORAGE_KEY = 'COUNTDOWN1_DEADLINE_TS';
        var savedTs = null;
        try { savedTs = localStorage.getItem(STORAGE_KEY); } catch (e) { savedTs = null; }
        var nowInit = Date.now();
        var parsed = savedTs ? parseInt(savedTs, 10) : NaN;
        var deadline = (!isNaN(parsed) && parsed > nowInit) ? parsed : (nowInit + 7 * 60 * 60 * 1000);
        try { localStorage.setItem(STORAGE_KEY, String(deadline)); } catch (e) { }

        function pad(n) { return n < 10 ? '0' + n : String(n); }

        var timer = setInterval(function () {
            var now = Date.now();
            var delta = Math.max(0, deadline - now);
            var totalSeconds = Math.floor(delta / 1000);
            var days = Math.floor(totalSeconds / 86400);
            var hours = Math.floor((totalSeconds % 86400) / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;

            if (spans1[0]) spans1[0].textContent = pad(days);
            if (spans1[1]) spans1[1].textContent = pad(hours);
            if (spans1[2]) spans1[2].textContent = pad(minutes);
            if (spans1[3]) spans1[3].textContent = pad(seconds);

            if (spans2[0]) spans2[0].textContent = pad(days);
            if (spans2[1]) spans2[1].textContent = pad(hours);
            if (spans2[2]) spans2[2].textContent = pad(minutes);
            if (spans2[3]) spans2[3].textContent = pad(seconds);

            if (delta <= 0) {
                clearInterval(timer);
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
            }
        }, 1000);
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var formWrap = document.getElementById('FORM4');
    if (!formWrap) return;
    var form = formWrap.querySelector('form');
    if (!form) return;

    var submitBtnWrap = formWrap.querySelector('#BUTTON6');
    var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwWBUIQL6qro22Hyrs0eXXlu7E9q4mUZb0kgHCLy88Mx1KeXpsUuCUS31in1XBdPqPY/exec';

    function setSubmitting(isSubmitting) {
        if (submitBtnWrap) {
            submitBtnWrap.style.pointerEvents = isSubmitting ? 'none' : '';
            submitBtnWrap.style.opacity = isSubmitting ? '0.6' : '';
        }
    }

    if (submitBtnWrap) {
        submitBtnWrap.addEventListener('click', function () {
            if (!form) return;
            var hiddenSubmit = form.querySelector('button[type="submit"]');
            if (hiddenSubmit) hiddenSubmit.click();
            else if (typeof form.requestSubmit === 'function') form.requestSubmit();
        });
    }

    form.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        setSubmitting(true);
        try {
            var nameInput = form.querySelector('input[name="name"]');
            var phoneInput = form.querySelector('input[name="phone"]');
            var addressInput = form.querySelector('input[name="address"]');
            var name = nameInput ? nameInput.value.trim() : '';
            var phone = phoneInput ? phoneInput.value.trim() : '';
            var address = addressInput ? addressInput.value.trim() : '';
            var combo = Array.from(form.querySelectorAll('input[name="form_item1165"]:checked')).map(function (i) { return i.value; });

            if (!ENDPOINT || ENDPOINT.indexOf('http') !== 0) throw new Error('Chưa cấu hình ENDPOINT');

            // Gửi dạng x-www-form-urlencoded để tránh preflight CORS
            var params = new URLSearchParams();
            params.append('name', name);
            params.append('phone', phone);
            params.append('address', address);
            combo.forEach(function (v) { params.append('combo', v); });

            var res = await fetch(ENDPOINT, {
                method: 'POST',
                // KHÔNG đặt headers tùy biến để giữ request đơn giản (simple request)
                body: params
            });

            var json = null;
            try {
                var ct = res.headers.get('content-type') || '';
                if (ct.indexOf('application/json') !== -1) {
                    json = await res.json();
                }
            } catch (e) { /* ignore parse error for no-cors */ }

            if (json && json.ok) {
                alert('Đã nhận đơn. Chúng tôi sẽ liên hệ sớm!');
                form.reset();
            } else if (res.ok && !json) {
                // Trường hợp Web App không trả CORS header -> không đọc được JSON
                alert('Đã gửi yêu cầu. Vui lòng chờ gọi lại!');
                form.reset();
            } else {
                var message = (json && json.message) ? json.message : ('HTTP ' + res.status);
                throw new Error(message);
            }
        } catch (e) {
            alert('Có lỗi khi gửi: ' + (e && e.message ? e.message : e));
        } finally {
            setSubmitting(false);
        }
    });
});


// Xoay nội dung #NOTIFY3 mỗi 15 giây và ẩn mặc định khi vào trang
document.addEventListener('DOMContentLoaded', function () {
    var notifyRoot = document.getElementById('NOTIFY3');
    if (!notifyRoot) return;

    // Bỏ class ladi-hidden nếu có để cho phép hiển thị khi cần (ở chính #NOTIFY3 và các phần tử con)
    try {
        if (notifyRoot.classList && notifyRoot.classList.contains('ladi-hidden')) {
            notifyRoot.classList.remove('ladi-hidden');
        }
        var hiddenChildren = notifyRoot.querySelectorAll('.ladi-hidden');
        hiddenChildren.forEach(function (el) {
            el.classList.remove('ladi-hidden');
        });
    } catch (e) { }

    var notifyBox = notifyRoot.querySelector('.ladi-notify');
    // Nếu .ladi-notify bị ẩn bằng class, bỏ ra
    try {
        if (notifyBox && notifyBox.classList && notifyBox.classList.contains('ladi-hidden')) {
            notifyBox.classList.remove('ladi-hidden');
        }
    } catch (e) { }
    if (notifyBox) {
        // Ẩn mặc định khi vào trang
        notifyBox.style.opacity = '0';
        notifyBox.style.top = '-162px';
        // Thêm transition mượt nếu chưa có
        if (!notifyBox.style.transition) {
            notifyBox.style.transition = 'opacity .4s ease, top .4s ease';
        }
    }

    // Danh sách nội dung notify
    var notifications = [
        { image: './images/sale.jpeg', title: 'Nguyễn Thị Thu Vân - 090487**12', content: 'Đã mua 2 hộp', time: '1 phút trước' },
        { image: './images/sale1.jpg', title: 'Trần Văn Quốc - 086166**67', content: 'Đã mua 3 tặng 1', time: '3 phút trước' },
        { image: './images/sale2.jpg', title: 'Lê Thị Kim Anh - 090487**12', content: 'Đã mua 1 hộp', time: '5 phút trước' },
        { image: './images/sale3.jpeg', title: 'Nguyễn Thị Thúy - 038687**54', content: 'Đã mua 1 hộp', time: '7 phút trước' },
        { image: './images/sale4.jpg', title: 'Vũ Thị Thư - 098647**32', content: 'Đã mua 2 hộp', time: '10 phút trước' },
        { image: './images/sale5.jpg', title: 'Hoàng Thị Thu Hà - 084354**79', content: 'Đã mua 3 tặng 1', time: '12 phút trước' },
        { image: './images/sale6.jpg', title: 'Phùng Khánh Linh - 096345**21', content: 'Đã mua 2 hộp', time: '14 phút trước' },

        { image: './images/sale.jpeg', title: 'Nguyễn Văn Dũng - 091234**88', content: 'Đã mua 2 hộp', time: '16 phút trước' },
        { image: './images/sale1.jpg', title: 'Phạm Thị Hồng - 097865**43', content: 'Đã mua 1 hộp', time: '18 phút trước' },
        { image: './images/sale2.jpg', title: 'Lê Văn Quân - 083456**92', content: 'Đã mua 3 tặng 1', time: '21 phút trước' },
        { image: './images/sale3.jpeg', title: 'Đỗ Thị Huyền - 090456**75', content: 'Đã mua 2 hộp', time: '23 phút trước' },
        { image: './images/sale4.jpg', title: 'Trần Thị Mai - 098732**58', content: 'Đã mua 1 hộp', time: '25 phút trước' },
        { image: './images/sale5.jpg', title: 'Ngô Thị Thanh - 086912**44', content: 'Đã mua 2 hộp', time: '27 phút trước' },
        { image: './images/sale6.jpg', title: 'Bùi Văn Hậu - 084512**99', content: 'Đã mua 3 tặng 1', time: '30 phút trước' },

        { image: './images/sale.jpeg', title: 'Phan Thị Hòa - 093678**66', content: 'Đã mua 1 hộp', time: '32 phút trước' },
        { image: './images/sale1.jpg', title: 'Nguyễn Thị Lan - 096854**23', content: 'Đã mua 2 hộp', time: '35 phút trước' },
        { image: './images/sale2.jpg', title: 'Trương Văn Hải - 090321**55', content: 'Đã mua 3 tặng 1', time: '37 phút trước' },
        { image: './images/sale3.jpeg', title: 'Lê Thị Hoa - 091998**11', content: 'Đã mua 1 hộp', time: '40 phút trước' },
        { image: './images/sale4.jpg', title: 'Võ Minh Thành - 092345**77', content: 'Đã mua 2 hộp', time: '42 phút trước' },
        { image: './images/sale5.jpg', title: 'Trần Hữu Nam - 089123**00', content: 'Đã mua 1 hộp', time: '45 phút trước' },
        { image: './images/sale6.jpg', title: 'Nguyễn Thị Phương - 097111**22', content: 'Mua combo 2', time: '47 phút trước' },

        { image: './images/sale.jpeg', title: 'Phạm Văn Long - 090999**33', content: 'Đã mua 2 hộp', time: '50 phút trước' },
        { image: './images/sale1.jpg', title: 'Đặng Thị Mai - 093444**55', content: 'Đã mua 3 tặng 1', time: '1 giờ trước' },
        { image: './images/sale2.jpg', title: 'Lý Thị Ánh - 088777**66', content: 'Đã mua 1 hộp', time: '1 giờ trước' },
        { image: './images/sale3.jpeg', title: 'Hà Văn Tùng - 094555**88', content: 'Đã mua 2 hộp', time: '1 giờ 5 phút trước' },
        { image: './images/sale4.jpg', title: 'Nguyễn Thị Yến - 091222**99', content: 'Đã mua 1 hộp', time: '1 giờ 10 phút trước' },
        { image: './images/sale5.jpg', title: 'Bảo Trâm - 095333**44', content: 'Đã mua 3 tặng 1', time: '1 giờ 15 phút trước' },
        { image: './images/sale6.jpg', title: 'Phạm Minh Phúc - 098000**11', content: 'Đặt trước 1', time: '1 giờ 20 phút trước' },

        { image: './images/sale.jpeg', title: 'Lâm Thị Ngọc - 092222**66', content: 'Đã mua 2 hộp', time: '1 giờ 30 phút trước' },
        { image: './images/sale1.jpg', title: 'Hoàng Văn Khoa - 093111**77', content: 'Mua combo 2', time: '1 giờ 35 phút trước' },
        { image: './images/sale2.jpg', title: 'Trần Thị Bích - 090777**88', content: 'Thanh toán thành công', time: '1 giờ 40 phút trước' },
        { image: './images/sale3.jpeg', title: 'Nguyễn Hữu Tuấn - 097999**00', content: 'Đã mua 1 hộp', time: '1 giờ 45 phút trước' },
        { image: './images/sale4.jpg', title: 'Đào Thị Liên - 096123**21', content: 'Đã mua 2 hộp', time: '1 giờ 50 phút trước' },
        { image: './images/sale5.jpg', title: 'Phan Văn Sơn - 089555**66', content: 'Đã mua 3 tặng 1', time: '1 giờ 55 phút trước' },
        { image: './images/sale6.jpg', title: 'Lê Thị Mỹ - 094888**99', content: 'Đã mua 1 hộp', time: '2 giờ trước' },

        { image: './images/sale.jpeg', title: 'Nguyễn Đức Hải - 091111**11', content: 'Đã mua 2 hộp', time: '2 giờ 5 phút trước' },
        { image: './images/sale1.jpg', title: 'Võ Thị Lan - 092333**22', content: 'Đã mua 1 hộp', time: '2 giờ 10 phút trước' },
        { image: './images/sale2.jpg', title: 'Trịnh Minh Châu - 093666**44', content: 'Mua combo 2', time: '2 giờ 20 phút trước' },
        { image: './images/sale3.jpeg', title: 'Bùi Thị Oanh - 098123**88', content: 'Thanh toán thành công', time: '2 giờ 30 phút trước' },
        { image: './images/sale4.jpg', title: 'Lương Văn Phúc - 090222**33', content: 'Đã mua 3 tặng 1', time: '2 giờ 40 phút trước' },
        { image: './images/sale5.jpg', title: 'Hồ Thị Kim - 096777**55', content: 'Đã mua 1 hộp', time: '2 giờ 50 phút trước' },
        { image: './images/sale6.jpg', title: 'Phạm Hoàng Anh - 094111**66', content: 'Đã mua 2 hộp', time: '3 giờ trước' },

        { image: './images/sale.jpeg', title: 'Nguyễn Thị Hằng - 095222**77', content: 'Đã mua 1 hộp', time: '3 giờ 10 phút trước' },
        { image: './images/sale1.jpg', title: 'Trần Quốc Bảo - 091777**44', content: 'Đã mua 2 hộp', time: '3 giờ 20 phút trước' },
        { image: './images/sale2.jpg', title: 'Đỗ Văn Phong - 093888**55', content: 'Đã mua 3 tặng 1', time: '3 giờ 30 phút trước' },
        { image: './images/sale3.jpeg', title: 'Nguyễn Thùy Dung - 090666**33', content: 'Mua combo 2', time: '3 giờ 40 phút trước' },
        { image: './images/sale4.jpg', title: 'Hoàng Thị Mai - 097444**22', content: 'Đã mua 1 hộp', time: '3 giờ 50 phút trước' },
        { image: './images/sale5.jpg', title: 'Phùng Văn Hòa - 089999**00', content: 'Đã mua 2 hộp', time: '4 giờ trước' },
        { image: './images/sale6.jpg', title: 'Lê Thị Vân - 092555**11', content: 'Đã mua 3 tặng 1', time: '4 giờ 10 phút trước' },

        { image: './images/sale.jpeg', title: 'Nguyễn Văn Sơn - 096444**88', content: 'Đặt trước 1', time: '4 giờ 20 phút trước' },
        { image: './images/sale1.jpg', title: 'Trần Thị Tuyết - 093222**66', content: 'Đã mua 1 hộp', time: '4 giờ 30 phút trước' },
        { image: './images/sale2.jpg', title: 'Bùi Thị Thu - 091555**33', content: 'Thanh toán thành công', time: '5 giờ trước' },
        { image: './images/sale3.jpeg', title: 'Nguyễn Minh Đức - 098666**77', content: 'Đã mua 2 hộp', time: '5 giờ 30 phút trước' }
    ];

    function renderNotify(item) {
        var img = notifyRoot.querySelector('.ladi-notify-image img');
        var title = notifyRoot.querySelector('.ladi-notify-title');
        var content = notifyRoot.querySelector('.ladi-notify-content');
        var time = notifyRoot.querySelector('.ladi-notify-time');
        if (img) img.src = item.image;
        if (title) title.textContent = item.title;
        if (content) content.textContent = item.content;
        if (time) time.textContent = item.time;
    }

    function swapTo(item) {
        if (!notifyBox) return;
        // Ẩn trước khi đổi nội dung để có hiệu ứng
        notifyBox.style.opacity = '0';
        notifyBox.style.top = '-162px';
        setTimeout(function () {
            renderNotify(item);
            // Hiện lại
            requestAnimationFrame(function () {
                notifyBox.style.opacity = '1';
                notifyBox.style.top = '0px';
            });
        }, 200);
    }

    var idx = 0;
    if (notifications.length) {
        function hideBox() {
            if (!notifyBox) return;
            notifyBox.style.opacity = '0';
            notifyBox.style.top = '-162px';
        }

        function cycle() {
            // Hiển thị mục hiện tại
            swapTo(notifications[idx]);
            // Sau 5s thì ẩn đi
            setTimeout(function () {
                hideBox();
                // 15s sau hiển thị mục kế tiếp
                setTimeout(function () {
                    idx = (idx + 1) % notifications.length;
                    cycle();
                }, 10000);
            }, 5000);
        }

        // Không hiển thị ngay khi vào trang: chờ 15s rồi mới hiển thị mục đầu tiên
        setTimeout(cycle, 5000);
    }
});