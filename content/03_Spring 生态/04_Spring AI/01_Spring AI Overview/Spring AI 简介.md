---
title: Spring AI 简介
description: 
author: Refinex
createdAt: 2026-02-22
updatedAt: 2026-02-22
---

# Spring AI 简介

如果你写 Spring Boot 服务，最近想在业务里接一个大模型做点事情（比如客服问答、文档检索、工单总结），你很快会遇到两类麻烦：

- **接模型**：不同供应商的 SDK、参数、返回结构各不相同。今天用 OpenAI，明天换 Anthropic 或 Azure OpenAI，经常要改一堆调用代码。
- **接数据和工具**：真正有价值的 “企业级 AI”，往往不是让模型自由发挥，而是让它能查你的知识库、调用你的业务 API、并且可观测、可评估、可治理。

Spring AI 的定位就是：**它不是大模型，而是一个面向 Java 的 AI 工程框架**，用 Spring 生态一贯的方式（可移植抽象、模块化、自动配置、POJO 友好）把上面这套事情做成 “可落地的工程骨架”。

## 1. Spring AI 是什么（以及它不是什么）

