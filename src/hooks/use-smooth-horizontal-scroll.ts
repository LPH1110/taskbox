import { useRef, useEffect, useCallback } from "react";

export function useSmoothHorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dùng Ref để lưu trữ giá trị mà không gây re-render
  const data = useRef({
    ease: 0.1, // Độ mượt (0.01 - 1). Càng nhỏ càng trượt chậm/mượt. 0.1 là vừa đẹp.
    current: 0, // Vị trí scroll hiện tại
    target: 0, // Vị trí scroll mong muốn
    isScrolling: false, // Trạng thái animation
    rafId: 0, // Request Animation Frame ID
  });

  // Hàm loop chạy liên tục để update scroll
  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { current, target, ease } = data.current;

    // Công thức LERP: Di chuyển current tiến về target một khoảng nhỏ
    // current mới = current cũ + (khoảng cách * hệ số)
    data.current.current += (target - current) * ease;

    // Apply vào DOM
    el.scrollLeft = data.current.current;

    // Nếu khoảng cách giữa current và target quá nhỏ (< 1px) thì dừng để tiết kiệm hiệu năng
    if (Math.abs(target - data.current.current) > 1) {
      data.current.rafId = requestAnimationFrame(update);
    } else {
      data.current.isScrolling = false;
      data.current.current = target; // Set bằng luôn cho chính xác
    }
  }, []);

  // Hàm xử lý sự kiện Wheel
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // Chỉ xử lý lăn dọc (Vertical Scroll) để map sang Ngang
      if (e.deltaY === 0) return;

      const el = containerRef.current;
      if (!el) return;

      // Nếu đây là lần lăn đầu tiên sau khi dừng, đồng bộ current với DOM thực tế
      // (để tránh bị giật nếu user dùng thanh kéo scrollbar trước đó)
      if (!data.current.isScrolling) {
        data.current.current = el.scrollLeft;
        data.current.target = el.scrollLeft;
        data.current.isScrolling = true;
        data.current.rafId = requestAnimationFrame(update);
      }

      // Cập nhật mục tiêu:
      // e.deltaY * 1.5: Tăng tốc độ scroll lên 1.5 lần (hoặc giảm tùy ý) để cảm giác lướt nhanh hơn
      data.current.target += e.deltaY * 1.5;

      // Giới hạn target không được vượt quá độ rộng nội dung (Clamp)
      const maxScroll = el.scrollWidth - el.clientWidth;
      data.current.target = Math.max(
        0,
        Math.min(data.current.target, maxScroll)
      );

      // Chặn scroll dọc mặc định của trình duyệt nếu đang scroll ngang được
      // (Chỉ chặn khi nội dung có thể scroll)
      if (maxScroll > 0) {
        // e.preventDefault(); // Lưu ý: React SyntheticEvent không chặn được native wheel passive,
        // nhưng logic này chủ yếu để xử lý JS, browser tự lo việc native.
      }
    },
    [update]
  );

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(data.current.rafId);
    };
  }, []);

  return { containerRef, onWheel };
}
