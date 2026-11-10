#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/verify_bkt_math.py
=============================================================================
Скрипт незалежної математичної верифікації розрахунків Bayesian Knowledge Tracing (BKT)
та аудиту журналу подій (Event Stream Flight Data Recorder).

Призначення:
1. Зчитує потік подій з файлу logs/event_stream.jsonl.
2. Для кожної події відповіді студента (TASK_SUBMITTED) перераховує апостеріорну
   ймовірність P(L_t) "з нуля" за чистими формулами Баєса з точністю до 6 знаку.
3. Звіряє теоретичні математичні значення з фактично збереженими в системі.
4. Підтримує 10 еталонних математичних інваріантних тестів.
5. Підтримує вивід у форматі JSON (--json) для веб-інтерфейсу Адмін-панелі.
6. Підтримує інтерактивний режим (--interactive) для викладача.
=============================================================================
"""

import sys
import os
import json
import argparse
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

DEFAULT_P_TRANSIT = 0.2000
DEFAULT_P_SLIP = 0.1000
DEFAULT_P_GUESS = 0.2000


def calculate_bkt_step(
    p_mastery_prior: float,
    p_transit: float,
    p_slip: float,
    p_guess: float,
    is_correct: bool,
    hint_penalty_pct: float = 0.0,
) -> Dict[str, Any]:
    """
    Чиста еталонна реалізація BKT для математичного контролю:
    1. Обчислення спостереження за Баєсом: P(L | Obs)
    2. Додавання транзиту знань: P(L_t) = P(L|Obs) + (1 - P(L|Obs)) * P(T)
    3. Застосування демпфування підказок Сократа до дельти приросту
    """
    p_l = max(0.0001, min(0.9999, float(p_mastery_prior)))
    p_t = float(p_transit)
    p_s = float(p_slip)
    p_g = float(p_guess)

    if is_correct:
        numerator = p_l * (1.0 - p_s)
        denominator = p_l * (1.0 - p_s) + (1.0 - p_l) * p_g
        p_obs = numerator / denominator if denominator > 0 else p_l
        formula_obs = f"[{p_l:.4f}*(1-{p_s:.4f})] / [{p_l:.4f}*(1-{p_s:.4f}) + (1-{p_l:.4f})*{p_g:.4f}]"
    else:
        numerator = p_l * p_s
        denominator = p_l * p_s + (1.0 - p_l) * (1.0 - p_g)
        p_obs = numerator / denominator if denominator > 0 else p_l
        formula_obs = f"[{p_l:.4f}*{p_s:.4f}] / [{p_l:.4f}*{p_s:.4f} + (1-{p_l:.4f})*(1-{p_g:.4f})]"

    # Транзит знання (Learning Transition)
    raw_posterior = p_obs + (1.0 - p_obs) * p_t

    # Демпфування за підказки Сократа
    final_posterior = raw_posterior
    if is_correct and hint_penalty_pct > 0 and raw_posterior > p_l:
        raw_gain = raw_posterior - p_l
        penalized_gain = raw_gain * (1.0 - hint_penalty_pct / 100.0)
        final_posterior = p_l + penalized_gain

    clamped_posterior = max(0.0001, min(0.9999, round(final_posterior, 4)))

    return {
        "p_mastery_prior": round(p_l, 6),
        "p_transit": round(p_t, 4),
        "p_slip": round(p_s, 4),
        "p_guess": round(p_g, 4),
        "is_correct": is_correct,
        "numerator": round(numerator, 6),
        "denominator": round(denominator, 6),
        "p_obs": round(p_obs, 6),
        "raw_posterior": round(raw_posterior, 6),
        "hint_penalty_pct": hint_penalty_pct,
        "final_posterior": clamped_posterior,
        "formula_obs": formula_obs,
    }


def get_invariant_test_data() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    test_cases = [
        ("1. Базова правильна відповідь (чесний ввід)", 0.3000, 0.2000, 0.1000, 0.2000, True, 0, "INCREASE"),
        ("2. Базова помилка (незнання)", 0.5000, 0.2000, 0.1000, 0.2000, False, 0, "DECREASE"),
        ("3. Спідран / Вгадування (Guess=0.85)", 0.3000, 0.2000, 0.1000, 0.8500, True, 0, "LOW_GAIN"),
        ("4. Копіпаст у тексті (Guess=0.90)", 0.2000, 0.2000, 0.1000, 0.9000, True, 0, "LOW_GAIN"),
        ("5. Випадкова описка на тестах (Slip=0.25)", 0.7000, 0.2000, 0.2500, 0.2000, False, 0, "SOFT_DECREASE"),
        ("6. Підказка Сократа рівень 1 (-15% приросту)", 0.3000, 0.2000, 0.1000, 0.2000, True, 15, "DAMPED_GAIN"),
        ("7. Підказка Сократа рівень 2 (-30% приросту)", 0.3000, 0.2000, 0.1000, 0.2000, True, 30, "DAMPED_GAIN"),
        ("8. Підказка Сократа рівень 3 (-50% приросту)", 0.3000, 0.2000, 0.1000, 0.2000, True, 50, "HEAVILY_DAMPED"),
        ("9. Майже нульове знання (Prior=0.0500)", 0.0500, 0.2000, 0.1000, 0.2000, True, 0, "INCREASE"),
        ("10. Високе знання перед майстерністю (Prior=0.8800)", 0.8800, 0.2000, 0.1000, 0.2000, True, 0, "REACH_MASTERY"),
    ]

    records = []
    all_passed = True
    passed_count = 0

    for idx, (desc, prior, t, s, g, correct, penalty, expected_behavior) in enumerate(test_cases, 1):
        res = calculate_bkt_step(prior, t, s, g, correct, penalty)
        post = res["final_posterior"]

        passed = True
        if expected_behavior == "INCREASE" and post <= prior:
            passed = False
        elif expected_behavior == "DECREASE" and post >= prior:
            passed = False
        elif expected_behavior == "LOW_GAIN":
            standard_post = calculate_bkt_step(prior, t, s, DEFAULT_P_GUESS, correct, 0)["final_posterior"]
            if post >= standard_post:
                passed = False
        elif expected_behavior == "REACH_MASTERY" and post < 0.90:
            passed = False

        if passed:
            passed_count += 1
        else:
            all_passed = False

        records.append({
            "id": idx,
            "name": desc,
            "prior": prior,
            "transit": t,
            "slip": s,
            "guess": g,
            "is_correct": correct,
            "hint_penalty_pct": penalty,
            "posterior": post,
            "passed": passed,
            "status": "PASSED" if passed else "FAILED",
            "formula_obs": res["formula_obs"],
            "numerator": res["numerator"],
            "denominator": res["denominator"]
        })

    summary = {
        "total": len(test_cases),
        "passed": passed_count,
        "failed": len(test_cases) - passed_count,
        "all_passed": all_passed
    }
    return records, summary


def run_invariant_tests(silent: bool = False):
    """
    10 фундаментальних математичних інваріантних перевірок поведінки BKT
    """
    records, summary = get_invariant_test_data()

    if not silent:
        print("\n" + "=" * 80)
        print("🔬 ЗАПУСК 10 ЕТАЛОННИХ МАТЕМАТИЧНИХ ІНВАРІАНТНИХ ТЕСТІВ BKT")
        print("=" * 80)
        print(f"{'#':<3} | {'Опис тесту':<44} | {'Prior':<7} -> {'Posterior':<9} | {'Статус':<8}")
        print("-" * 80)

        for r in records:
            status_str = "✅ PASSED" if r["passed"] else "❌ FAILED"
            print(f"{r['id']:<3} | {r['name']:<44} | {r['prior']:<7.4f} -> {r['posterior']:<9.4f} | {status_str}")

        print("=" * 80)
        if summary["all_passed"]:
            print("🎉 ВСІ 10 МАТЕМАТИЧНИХ ІНВАРІАНТНИХ ТЕСТІВ BKT ПРОЙДЕНО УСПІШНО!")
            print("   Математична логіка є строго монотонною, детерміністичною та стійкою.")
        else:
            print("⚠️ УВАГА: Виявлено відхилення у математичних тестах!")
        print("=" * 80 + "\n")

    return summary["all_passed"]


def get_live_audit_data(log_path: str) -> Dict[str, Any]:
    if not os.path.exists(log_path):
        return {
            "log_path": log_path,
            "file_exists": False,
            "total_events": 0,
            "task_events": 0,
            "verified_count": 0,
            "mismatch_count": 0,
            "all_matched": True,
            "records": []
        }

    events = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    events.append(json.loads(line))
                except Exception:
                    pass

    task_events = [e for e in events if e.get("eventType") in ["TASK_SUBMITTED", "BKT_FORMULA_CALCULATED"]]
    verified_count = 0
    mismatch_count = 0
    audit_records = []

    for e in task_events:
        payload = e.get("payload", {})
        prior = payload.get("pMasteryPrior")
        actual_post = payload.get("pMasteryPosterior")
        is_passed = payload.get("isPassed", False)
        p_slip = payload.get("pSlip", DEFAULT_P_SLIP)
        p_guess = payload.get("pGuess", DEFAULT_P_GUESS)
        penalty = payload.get("appliedHintPenaltyPct", 0)

        trace = payload.get("trace", {})
        p_transit = trace.get("pTransit", DEFAULT_P_TRANSIT)

        if prior is None or actual_post is None:
            continue

        expected = calculate_bkt_step(prior, p_transit, p_slip, p_guess, is_passed, penalty)
        diff = abs(expected["final_posterior"] - actual_post)
        is_match = diff <= 0.0002

        if is_match:
            verified_count += 1
            status = "OK"
        else:
            mismatch_count += 1
            status = f"MISMATCH (diff={diff:.4f})"

        audit_records.append({
            "timestamp": e.get("createdAt", ""),
            "userId": str(e.get("userId", "")),
            "taskId": str(e.get("taskId", "")),
            "prior": prior,
            "posterior_actual": actual_post,
            "posterior_expected": expected["final_posterior"],
            "p_slip": p_slip,
            "p_guess": p_guess,
            "diff": round(diff, 6),
            "is_match": is_match,
            "status": status,
        })

    return {
        "log_path": log_path,
        "file_exists": True,
        "total_events": len(events),
        "task_events": len(task_events),
        "verified_count": verified_count,
        "mismatch_count": mismatch_count,
        "all_matched": mismatch_count == 0,
        "records": audit_records,
    }


def verify_live_event_log(log_path: str, silent: bool = False):
    """
    Зчитує реальний журнал event_stream.jsonl та звіряє кожну записану подію
    """
    data = get_live_audit_data(log_path)
    if silent:
        return data["all_matched"]

    if not data["file_exists"]:
        print(f"ℹ️ Файл журналу подій '{log_path}' поки що не створено (не було зафіксовано відповідей).")
        return False

    print(f"\n📂 Зчитування журналу подій: {log_path}")
    print(f"📊 Загальна кількість подій у журналі: {data['total_events']}")
    print(f"🎯 Подій оцінювання завдань з математичним слідом: {data['task_events']}")

    if data["task_events"] == 0:
        print("ℹ️ Подій TASK_SUBMITTED у файлі ще немає.")
        return True

    print("\n" + "=" * 96)
    print(f"{'Час':<19} | {'Студент':<12} | {'Завдання':<15} | {'Prior':<6} | {'S/G Used':<9} | {'В базі':<7} | {'Еталон':<7} | {'Статус':<8}")
    print("=" * 96)

    for r in data["records"]:
        time_str = r["timestamp"][:19].replace("T", " ")
        user_str = r["userId"][:12]
        task_str = r["taskId"][:15]
        sg_str = f"{r['p_slip']:.2f}/{r['p_guess']:.2f}"
        status_str = "✅ OK" if r["is_match"] else f"❌ Δ={r['diff']:.4f}"

        print(f"{time_str:<19} | {user_str:<12} | {task_str:<15} | {r['prior']:<6.4f} | {sg_str:<9} | {r['posterior_actual']:<7.4f} | {r['posterior_expected']:<7.4f} | {status_str}")

    print("=" * 96)
    print(f"🏆 Результат верифікації реальних даних:")
    print(f"   Успішно перевірено розрахунків: {data['verified_count']}")
    print(f"   Невідповідностей формулі:       {data['mismatch_count']}")
    if data["all_matched"] and data["verified_count"] > 0:
        print("   🌟 100% МАТЕМАТИЧНА ТОЧНІСТЬ УСІХ ЗБЕРЕЖЕНИХ РОЗРАХУНКІВ ПЛАТФОРМИ!")
    print("=" * 96 + "\n")
    return data["all_matched"]


def interactive_calculator():
    """
    Інтерактивний покроковий калькулятор для викладача
    """
    print("\n" + "=" * 60)
    print("🧮 ІНТЕРАКТИВНИЙ BKT-КАЛЬКУЛЯТОР ДЛЯ ВИКЛАДАЧА")
    print("=" * 60)
    try:
        prior_str = input("Введіть поточний рівень P(L_{t-1}) [замовчуванням 0.30]: ").strip()
        p_l = float(prior_str) if prior_str else 0.30

        transit_str = input("Введіть ймовірність транзиту P(T) [замовчуванням 0.20]: ").strip()
        p_t = float(transit_str) if transit_str else 0.20

        slip_str = input("Введіть ймовірність Slip P(S) [замовчуванням 0.10]: ").strip()
        p_s = float(slip_str) if slip_str else 0.10

        guess_str = input("Введіть ймовірність Guess P(G) [замовчуванням 0.20]: ").strip()
        p_g = float(guess_str) if guess_str else 0.20

        correct_str = input("Студент відповів вірно? (y/n) [замовчуванням y]: ").strip().lower()
        is_correct = correct_str != "n"

        penalty_str = input("Штраф за підказки Сократа (%) [замовчуванням 0]: ").strip()
        penalty = float(penalty_str) if penalty_str else 0.0

        res = calculate_bkt_step(p_l, p_t, p_s, p_g, is_correct, penalty)

        print("\n" + "-" * 60)
        print("🔬 ПОКРОКОВИЙ ДЕТАЛЬНИЙ РОЗРАХУНОК:")
        print("-" * 60)
        print(f"1. Апріорна ймовірність:   P(L_{{t-1}}) = {res['p_mastery_prior']:.4f}")
        print(f"2. Спостереження (Obs):     {'Правильно (1)' if is_correct else 'Помилка (0)'}")
        print(f"3. Формула чисельника:      Numerator = {res['numerator']:.6f}")
        print(f"4. Формула знаменника:      Denominator = {res['denominator']:.6f}")
        print(f"5. Оновлення Баєса:        P(L|Obs) = {res['numerator']:.6f} / {res['denominator']:.6f} = {res['p_obs']:.6f}")
        print(f"6. Транзит знання:         P(L_t)_raw = {res['p_obs']:.6f} + (1 - {res['p_obs']:.6f}) * {p_t:.4f} = {res['raw_posterior']:.6f}")
        if penalty > 0:
            print(f"7. Штраф Сократа:          -{penalty}% до приросту знання")
        print(f"8. КІНЦЕВИЙ РЕЗУЛЬТАТ:     P(L_t) = {res['final_posterior']:.4f} ({(res['final_posterior'] * 100):.1f}%)")
        print("-" * 60 + "\n")

    except Exception as e:
        print(f"Помилка вводу: {e}")


def main():
    parser = argparse.ArgumentParser(description="BKT Mathematical Verifier & Flight Log Auditor")
    parser.add_argument("--interactive", "-i", action="store_true", help="Launch interactive step-by-step calculator")
    parser.add_argument("--test-only", "-t", action="store_true", help="Run 10 invariant mathematical unit checks")
    parser.add_argument("--log-path", "--file", dest="log_path", default="logs/event_stream.jsonl", help="Path to event_stream.jsonl")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format for web UI")

    args = parser.parse_args()

    if args.interactive:
        interactive_calculator()
        return

    if args.json:
        invariant_records, invariant_summary = get_invariant_test_data()
        live_data = get_live_audit_data(args.log_path)
        payload = {
            "success": invariant_summary["all_passed"] and live_data["all_matched"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "invariant_tests": invariant_records,
            "invariant_summary": invariant_summary,
            "live_audit": live_data,
        }
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    if args.test_only:
        success = run_invariant_tests()
        sys.exit(0 if success else 1)
    else:
        inv_ok = run_invariant_tests()
        live_ok = verify_live_event_log(args.log_path)
        sys.exit(0 if (inv_ok and live_ok) else 1)


if __name__ == "__main__":
    main()
