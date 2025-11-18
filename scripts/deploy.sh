#!/bin/bash

echo "🚀 Starting EduPlatform deployment..."

# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend-api.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/ingress.yaml

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -l app=postgresql -n eduplatform --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend-api -n eduplatform --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend -n eduplatform --timeout=180s

echo "✅ Deployment completed!"
echo "📊 Checking pod status:"
kubectl get pods -n eduplatform

echo "🌐 Services:"
kubectl get svc -n eduplatform