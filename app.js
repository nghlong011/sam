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
        try { localStorage.setItem(STORAGE_KEY, String(deadline)); } catch (e) {}

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
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
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

