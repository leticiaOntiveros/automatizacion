import { useState } from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Radio,
  Grid,
} from "@mui/material";

export const componentRadioButton = ({ options, value, onChange }) => {
  return (
    <Grid container spacing={2}>
      {options.map((option) => (
        <Grid item xs={12} sm={4} key={option.id}>
          <Card
            variant="outlined"
            sx={{
              border: value === option.id ? "2px solid #1976d2" : "1px solid #ccc",
              boxShadow: value === option.id ? 4 : 1,
              transition: "0.3s",
            }}
          >
            <CardActionArea onClick={() => onChange(option.id)}>
              <CardMedia
                component="img"
                height="140"
                image={option.image}
                alt={option.label}
              />
              <CardContent sx={{ textAlign: "center", position: "relative" }}>
                <Typography variant="subtitle1">{option.label}</Typography>
                <Radio
                  checked={value === option.id}
                  value={option.id}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                />
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
